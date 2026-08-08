from collections import defaultdict
from time import time
import requests

class Flow:

    def __init__(self, key):
        self.key = key

        self.start_time = None
        self.last_time = None

        self.forward_packets = []
        self.backward_packets = []

    def add_packet(self, packet, direction):
        now = float(packet.time)
        if self.start_time is None:
            self.start_time = now

        self.last_time = now

        packet_info = {
            "time": now,
            "length": len(packet),
            "header_length": 0,
            "window": 0,
            "FIN": 0,
            "SYN": 0,
            "RST": 0,
            "PSH": 0,
            "ACK": 0,
            "URG": 0,
            "CWE": 0, 
            "ECE": 0,
            "payload_length": 0,
            "ip_header_length": 0,
            "tcp_header_length": 0,
            "seg_size": 0,
        }

        if packet.haslayer("TCP"):

            tcp = packet["TCP"]

            packet_info["window"] = tcp.window

            packet_info["tcp_header_length"] = (
                tcp.dataofs * 4 if tcp.dataofs else 20
            )

            if packet.haslayer("IP"):
                packet_info["ip_header_length"] = packet["IP"].ihl * 4

            packet_info["header_length"] = (
                packet_info["ip_header_length"]
                + packet_info["tcp_header_length"]
            )

            packet_info["payload_length"] = len(tcp.payload)

            packet_info["seg_size"] = len(tcp)

            flags = str(tcp.flags)

            packet_info["FIN"] = int("F" in flags)
            packet_info["SYN"] = int("S" in flags)
            packet_info["RST"] = int("R" in flags)
            packet_info["PSH"] = int("P" in flags)
            packet_info["ACK"] = int("A" in flags)
            packet_info["URG"] = int("U" in flags)
            packet_info["CWE"] = int("W" in flags)
            packet_info["ECE"] = int("E" in flags)


        if direction == "forward":
            self.forward_packets.append(packet_info)
        else:
            self.backward_packets.append(packet_info)

    @property
    def duration(self):
        return (self.last_time - self.start_time) * 1_000_000

    @property
    def total_fwd_packets(self):
        return len(self.forward_packets)

    @property
    def total_bwd_packets(self):
        return len(self.backward_packets)

    @property
    def total_fwd_bytes(self):
        return sum(p["length"] for p in self.forward_packets)

    @property
    def total_bwd_bytes(self):
        return sum(p["length"] for p in self.backward_packets)


class FlowTracker:

    def __init__(self):
        self.flows = {}
        self.alerted_flows = set()

    def get_flow(self, packet):

        if not packet.haslayer("IP"):
            return None, None

        ip = packet["IP"]

        src_ip = ip.src
        dst_ip = ip.dst

        src_port = 0
        dst_port = 0
        protocol = ip.proto

        if packet.haslayer("TCP"):
            src_port = packet["TCP"].sport
            dst_port = packet["TCP"].dport

        elif packet.haslayer("UDP"):
            src_port = packet["UDP"].sport
            dst_port = packet["UDP"].dport

        key = (
            src_ip,
            dst_ip,
            src_port,
            dst_port,
            protocol,
        )

        reverse_key = (
            dst_ip,
            src_ip,
            dst_port,
            src_port,
            protocol,
        )

        if key in self.flows:

            return self.flows[key], "forward"

        if reverse_key in self.flows:

            return self.flows[reverse_key], "backward"

        self.flows[key] = Flow(key)

        return self.flows[key], "forward"

    def add_packet(self, packet):

        flow, direction = self.get_flow(packet)

        if flow is None:
            return None

        flow.add_packet(packet, direction)

        return flow

def send_alert_to_backend(result, features):
    """
    Send malicious ML predictions to the Node.js backend.
    """

    try:
        # Never create alerts for normal traffic
        if result["prediction"] == "BENIGN":
            return

        payload = {
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "probabilities": result["probabilities"],
            "features": features,
            "model": result["model"],
        }

        response = requests.post(
            "http://localhost:5000/api/alerts/internal",
            json=payload,
            timeout=5,
        )

        if response.status_code in (200, 201):
            print("=" * 60)
            print("SECURITY ALERT SENT TO BACKEND")
            print("=" * 60)
            print("Threat:", result["prediction"])
            print("Confidence:", result["confidence"], "%")
            print("Backend:", response.status_code)
            print("=" * 60)

        else:
            print("Alert backend error:")
            print(response.status_code)
            print(response.text)

    except requests.RequestException as error:
        print("Could not send alert to backend:")
        print(error)


if __name__ == "__main__":

    from scapy.all import sniff
    from network.features import calculate_features
    from predict import Predictor

    tracker = FlowTracker()

    # Load ML models only ONCE
    predictor = Predictor()


    def process(packet):

        flow = tracker.add_packet(packet)

        if flow:

            print(
                "Flow:",
                flow.key,
                "| Fwd:",
                flow.total_fwd_packets,
                "| Bwd:",
                flow.total_bwd_packets,
                "| Duration:",
                round(flow.duration, 2),
            )

            # Generate prediction after at least 5 packets
            if flow.total_fwd_packets + flow.total_bwd_packets >= 5:

                features = calculate_features(flow)

                print("=" * 60)
                print("70 FEATURES GENERATED")
                print("=" * 60)

                print("Feature count:", len(features))

                # --------------------------------------------------
                # LIVE FEATURE VALUES
                # --------------------------------------------------

                print("=" * 60)
                print("LIVE FEATURE VALUES")
                print("=" * 60)

                for name, value in zip(
                    predictor.feature_names,
                    features
                ):
                    print(f"{name:35} {value}")

                print("=" * 60)

                # --------------------------------------------------
                # SAFETY CHECK
                # --------------------------------------------------

                if len(features) != 70:

                    print(
                        "ERROR: Expected 70 features!"
                    )

                    return

                # --------------------------------------------------
                # XGBOOST PREDICTION
                # --------------------------------------------------

                result = predictor.predict(features)

                # --------------------------------------------------
                # DISPLAY ML RESULT
                # --------------------------------------------------

                print("=" * 60)
                print("LIVE ML PREDICTION")
                print("=" * 60)

                print(
                    "Model:",
                    result["model"]
                )

                print(
                    "Prediction:",
                    result["prediction"]
                )

                print(
                    "Confidence:",
                    result["confidence"],
                    "%"
                )

                print("Probabilities:")

                for cls, probability in result[
                    "probabilities"
                ].items():

                    print(
                        f"  {cls}: {probability}%"
                    )

                print("=" * 60)

                # --------------------------------------------------
                # SECURITY ALERT
                # --------------------------------------------------

                if result["prediction"] != "BENIGN":

                    flow_id = flow.key

                    # Check whether this flow already
                    # generated an alert
                    if flow_id not in tracker.alerted_flows:

                        print("=" * 60)
                        print("NEW SECURITY THREAT DETECTED")
                        print("=" * 60)

                        print(
                            "Flow:",
                            flow_id
                        )

                        print(
                            "Threat:",
                            result["prediction"]
                        )

                        print(
                            "Confidence:",
                            result["confidence"],
                            "%"
                        )

                        # Send alert to Node.js
                        send_alert_to_backend(
                            result,
                            features
                        )

                        # Remember this flow
                        tracker.alerted_flows.add(
                            flow_id
                        )

                        print(
                            "Alert registered for this flow."
                        )

                        print("=" * 60)

                    else:

                        print(
                            "Duplicate alert skipped for flow:",
                            flow_id
                        )
