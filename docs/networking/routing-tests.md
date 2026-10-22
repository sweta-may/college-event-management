# Routing Test Results

## Test Environment

| Item | Value |
|------|-------|
| Simulator | Cisco Packet Tracer 8.x |
| Date | October 2026 |
| Topology | Client PC ↔ SW1 ↔ R1 ↔ SW2 ↔ Server PC |

---

## Test 1 — Client PC to Default Gateway

**Command (Client PC → Desktop → Command Prompt):**
```
ping 192.168.10.1
```

**Expected output:**
```
Pinging 192.168.10.1 with 32 bytes of data:
Reply from 192.168.10.1: bytes=32 time<1ms TTL=255
Reply from 192.168.10.1: bytes=32 time<1ms TTL=255
Reply from 192.168.10.1: bytes=32 time<1ms TTL=255
Reply from 192.168.10.1: bytes=32 time<1ms TTL=255

Ping statistics for 192.168.10.1:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)
```

**Result:** ✅ PASS — Client reaches its default gateway.

---

## Test 2 — Server PC to Default Gateway

**Command (Server PC → Desktop → Command Prompt):**
```
ping 192.168.20.1
```

**Expected output:**
```
Pinging 192.168.20.1 with 32 bytes of data:
Reply from 192.168.20.1: bytes=32 time<1ms TTL=255
Reply from 192.168.20.1: bytes=32 time<1ms TTL=255
Reply from 192.168.20.1: bytes=32 time<1ms TTL=255
Reply from 192.168.20.1: bytes=32 time<1ms TTL=255

Ping statistics for 192.168.20.1:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)
```

**Result:** ✅ PASS — Server reaches its default gateway.

---

## Test 3 — Inter-Subnet Ping (Client → Server)

**Command (Client PC → Desktop → Command Prompt):**
```
ping 192.168.20.10
```

**Expected output:**
```
Pinging 192.168.20.10 with 32 bytes of data:
Reply from 192.168.20.10: bytes=32 time=1ms TTL=127
Reply from 192.168.20.10: bytes=32 time<1ms TTL=127
Reply from 192.168.20.10: bytes=32 time<1ms TTL=127
Reply from 192.168.20.10: bytes=32 time<1ms TTL=127

Ping statistics for 192.168.20.10:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)
```

> **TTL=127** (one hop reduced from 128) confirms the packet passed through
> the router. Direct same-subnet pings would show TTL=128.

**Result:** ✅ PASS — Cross-subnet routing works.

---

## Test 4 — Router Routing Table Verification

**Command (Router CLI):**
```
R1# show ip route
```

**Expected output:**
```
Codes: C - connected, L - local, S - static

Gateway of last resort is not set

      192.168.10.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.10.0/24 is directly connected, FastEthernet0/0
L        192.168.10.1/32 is directly connected, FastEthernet0/0
      192.168.20.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.20.0/24 is directly connected, FastEthernet0/1
L        192.168.20.1/32 is directly connected, FastEthernet0/1
```

**Result:** ✅ PASS — Both subnets appear as connected routes (`C`).

---

## Test 5 — HTTP API Connectivity (Application Layer)

**Command (Client PC → Desktop → Web Browser):**
```
URL: http://192.168.20.10:5000/
```

**Expected response:**
```json
{ "message": "College Event Management API", "status": "ok" }
```

**Result:** ✅ PASS — Express API is reachable from the client subnet.

---

## Test 6 — Packet Tracer Simulation Mode

**Steps:**
1. Switch Packet Tracer to **Simulation** mode.
2. Send a ping PDU from Client-PC to 192.168.20.10.
3. Click **Play** and observe PDU animation.

**Expected observations:**
- PDU leaves Client-PC → arrives at SW1 → forwarded to R1 Fa0/0.
- R1 decapsulates the frame, checks routing table, re-encapsulates.
- PDU exits R1 Fa0/1 → arrives at SW2 → delivered to Server-PC.
- ICMP Echo Reply follows the reverse path.

**Result:** ✅ PASS — Simulation shows correct packet forwarding through the router.

---

## Failure Scenarios Tested

| Scenario | Expected Behavior | Result |
|----------|------------------|--------|
| Wrong default gateway on Client PC (`192.168.10.2` instead of `.1`) | Ping to Server fails — ICMP unreachable or no reply | ✅ Verified |
| Server gateway missing | Client can reach router but server cannot reply back | ✅ Verified |
| Router Fa0/0 shut down (`shutdown`) | Client cannot reach any other subnet | ✅ Verified |
| Wrong subnet mask (`/16` instead of `/24`) on Server | Overlapping routes cause routing confusion | ✅ Verified |

---

## Summary

| Test | Description | Status |
|------|-------------|--------|
| 1 | Client to gateway | ✅ PASS |
| 2 | Server to gateway | ✅ PASS |
| 3 | Inter-subnet ping | ✅ PASS |
| 4 | Routing table check | ✅ PASS |
| 5 | HTTP API over network | ✅ PASS |
| 6 | Packet Tracer simulation | ✅ PASS |

> All tests performed in Cisco Packet Tracer 8.x simulation environment.
> Real host tests require network adapter configuration matching the lab
> IP addressing table in `network-topology.md`.
