# Network Topology — College Event Management System

## Overview

This document describes the IP network design used to demonstrate how the
**College Event Management System** (MERN stack) communicates across two
distinct IP subnets connected by a router, simulating a real-world
client–server deployment.

> **Important distinction**
> - **React Router DOM** → navigates between frontend pages (JS)
> - **Express routing** → maps HTTP paths to API handlers (JS)
> - **IP routing** → forwards packets between different IP networks (networking)
>
> Only the third concept is documented here.

---

## Network Diagram

```
 192.168.10.0/24 (Client Network)          192.168.20.0/24 (Server Network)
 ┌──────────────────────┐                  ┌──────────────────────┐
 │  Client PC           │                  │  Server PC           │
 │  IP: 192.168.10.10   │                  │  IP: 192.168.20.10   │
 │  Mask: /24           │                  │  Mask: /24           │
 │  GW:  192.168.10.1   │                  │  GW:  192.168.20.1   │
 └────────┬─────────────┘                  └────────┬─────────────┘
          │                                         │
    [Switch SW1]                              [Switch SW2]
          │                                         │
          └──────────── [Router R1] ────────────────┘
                        Fa0/0: 192.168.10.1/24
                        Fa0/1: 192.168.20.1/24
```

---

## IP Addressing Table

| Device              | Interface | IP Address       | Subnet Mask       | Default Gateway  |
|---------------------|-----------|------------------|-------------------|-----------------|
| Router R1           | Fa0/0     | 192.168.10.1     | 255.255.255.0     | —               |
| Router R1           | Fa0/1     | 192.168.20.1     | 255.255.255.0     | —               |
| Client PC           | NIC       | 192.168.10.10    | 255.255.255.0     | 192.168.10.1    |
| Server PC           | NIC       | 192.168.20.10    | 255.255.255.0     | 192.168.20.1    |
| Switch SW1          | VLAN1     | 192.168.10.2     | 255.255.255.0     | 192.168.10.1    |
| Switch SW2          | VLAN1     | 192.168.20.2     | 255.255.255.0     | 192.168.20.1    |

---

## Subnet Details

| Network           | Subnet Mask       | CIDR | Usable Range              | Broadcast       |
|-------------------|-------------------|------|--------------------------|-----------------|
| 192.168.10.0      | 255.255.255.0     | /24  | .1 – .254                | 192.168.10.255  |
| 192.168.20.0      | 255.255.255.0     | /24  | .1 – .254                | 192.168.20.255  |

---

## Application Traffic Flow

```
Browser (192.168.10.10:*) → Client NIC → Switch SW1
  → Router R1 (Fa0/0: .10.1 → Fa0/1: .20.1)
    → Switch SW2 → Server NIC (192.168.20.10:5000)
      → Node.js / Express API
        → MongoDB (127.0.0.1:27017 on same server)
          → Express Response → back through router → Browser
```

**Key points:**
- MongoDB is bound to `127.0.0.1` and is **not** exposed to either subnet.
- Express listens on `0.0.0.0:5000` so it accepts connections from both subnets.
- The React frontend sets `VITE_API_URL=http://192.168.20.10:5000/api` in the lab environment.

---

## Packet Tracer File

See [`packet-tracer-lab.pkt`](../networking/packet-tracer-lab.pkt) for the
full simulation topology.

### Devices in simulation
- **1 × Cisco 2811 Router (R1)**
- **2 × Cisco 2950 Switches (SW1, SW2)**
- **2 × PCs (Client-PC, Server-PC)**

---

## Security Notes

| Concern | Mitigation |
|---------|-----------|
| MongoDB exposure | Bound to 127.0.0.1 only |
| Express port (5000) | Opened only on Server PC in lab; firewall rule on real Windows host |
| CORS | Backend `CLIENT_URL` set to `http://192.168.10.10:5173` |
| Secrets | `.env` not committed to Git |
