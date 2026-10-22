# Router & End-Device Configuration

## Router R1 (Cisco IOS)

```
! Enter global configuration mode
Router> enable
Router# configure terminal

! Set hostname
Router(config)# hostname R1

! Configure FastEthernet0/0 — Client Network (192.168.10.0/24)
R1(config)# interface FastEthernet0/0
R1(config-if)# ip address 192.168.10.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# description Client-Network
R1(config-if)# exit

! Configure FastEthernet0/1 — Server Network (192.168.20.0/24)
R1(config)# interface FastEthernet0/1
R1(config-if)# ip address 192.168.20.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# description Server-Network
R1(config-if)# exit

! Save configuration
R1(config)# exit
R1# write memory
```

> Both subnets are **directly connected** to R1, so no static routes are needed.
> The router automatically creates connected routes for each configured interface.

---

## Verify Router Interfaces

```
R1# show interfaces FastEthernet0/0
! Expected: FastEthernet0/0 is up, line protocol is up
! Internet address is 192.168.10.1/24

R1# show interfaces FastEthernet0/1
! Expected: FastEthernet0/1 is up, line protocol is up
! Internet address is 192.168.20.1/24
```

---

## Routing Table (Expected Output)

```
R1# show ip route

Codes: C - connected, S - static, ...

      192.168.10.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.10.0/24 is directly connected, FastEthernet0/0
L        192.168.10.1/32 is directly connected, FastEthernet0/0
      192.168.20.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.20.0/24 is directly connected, FastEthernet0/1
L        192.168.20.1/32 is directly connected, FastEthernet0/1
```

Both networks appear as `C` (connected) — no static routes required.

---

## Client PC Configuration

**Cisco Packet Tracer: Desktop → IP Configuration**

| Field           | Value           |
|-----------------|-----------------|
| IP Address      | 192.168.10.10   |
| Subnet Mask     | 255.255.255.0   |
| Default Gateway | 192.168.10.1    |
| DNS Server      | (leave blank)   |

**Windows (real host):**
```
netsh interface ip set address "Ethernet" static 192.168.10.10 255.255.255.0 192.168.10.1
```

---

## Server PC Configuration

**Cisco Packet Tracer: Desktop → IP Configuration**

| Field           | Value           |
|-----------------|-----------------|
| IP Address      | 192.168.20.10   |
| Subnet Mask     | 255.255.255.0   |
| Default Gateway | 192.168.20.1    |
| DNS Server      | (leave blank)   |

**Windows (real host):**
```
netsh interface ip set address "Ethernet" static 192.168.20.10 255.255.255.0 192.168.20.1
```

---

## Application Configuration for Lab Environment

On the **Server PC**, update `server/.env`:
```
# Use 0.0.0.0 so Express accepts connections from the client subnet
# The NODE binding is set in server.js: app.listen(PORT, '0.0.0.0', ...)
PORT=5000
CLIENT_URL=http://192.168.10.10:5173
```

On the **Client PC**, create `client/.env`:
```
VITE_API_URL=http://192.168.20.10:5000/api
```

### Windows Firewall — allow port 5000 on Server PC
```powershell
New-NetFirewallRule -DisplayName "CEM API" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
```

---

## Switch Configuration (Optional)

Switches SW1 and SW2 use default configuration in Packet Tracer.
No VLANs or trunking are required for this topology.
