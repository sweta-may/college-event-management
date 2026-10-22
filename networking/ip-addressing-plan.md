# IP Addressing Plan — College Event Management System

## Network Overview

Two subnets connected by a single router to simulate a real-world
client–server deployment across separate IP networks.

---

## Subnets

| Network ID       | CIDR | Subnet Mask       | Hosts | Purpose         |
|------------------|------|-------------------|-------|-----------------|
| 192.168.10.0     | /24  | 255.255.255.0     | 254   | Client network  |
| 192.168.20.0     | /24  | 255.255.255.0     | 254   | Server network  |

---

## Host Assignments

| Host              | IP Address     | Role                       |
|-------------------|----------------|----------------------------|
| Router Fa0/0      | 192.168.10.1   | Client subnet gateway      |
| Router Fa0/1      | 192.168.20.1   | Server subnet gateway      |
| Client PC         | 192.168.10.10  | React frontend (port 5173) |
| Server PC         | 192.168.20.10  | Express API (port 5000)    |
| Switch SW1 (mgmt) | 192.168.10.2   | L2 switch — client side    |
| Switch SW2 (mgmt) | 192.168.20.2   | L2 switch — server side    |

---

## Ports Used

| Service       | Port  | Protocol | Bound to       |
|---------------|-------|----------|----------------|
| Express API   | 5000  | TCP      | 0.0.0.0 (all)  |
| React (Vite)  | 5173  | TCP      | 0.0.0.0 (all)  |
| MongoDB       | 27017 | TCP      | 127.0.0.1 only |

---

## Routing Summary

No static routes required. Both subnets are directly connected to R1.

| Destination     | Next Hop / Exit Interface |
|-----------------|--------------------------|
| 192.168.10.0/24 | Directly connected Fa0/0 |
| 192.168.20.0/24 | Directly connected Fa0/1 |

---

## Binary Subnet Analysis

### 192.168.10.0/24
```
Network:   11000000.10101000.00001010.00000000
Mask:      11111111.11111111.11111111.00000000
                                      ^^^^^^^^ — 8 host bits → 254 usable hosts
```

### 192.168.20.0/24
```
Network:   11000000.10101000.00010100.00000000
Mask:      11111111.11111111.11111111.00000000
                                      ^^^^^^^^ — 8 host bits → 254 usable hosts
```
