# ?? OMP Server Docker Stack

This project provides a fully automated, containerized environment for **Open Multiplayer (OMP)** development. It features a Node.js supervisor for **Auto-Restart on re-compile**, a pre-configured **MariaDB** database, and **phpMyAdmin** for easy data management.

---

## ?? System Architecture

The environment is orchestrated using Docker Compose and consists of three main layers:

* **Application Layer (`server_omp`)**: Runs the OMP server on Ubuntu 22.04 with a Node.js wrapper (`app.js`) to monitor gamemode changes.
* **Database Layer (`omp_mysql`)**: Powered by **MariaDB 10.4**. Uses Docker volumes for persistent data.
* **Management Layer (`phpmyadmin`)**: Web-based UI for SQL management.

---

## ?? Project Structure

For the system to work correctly, organize your files as follows:

```text

??? .env                     # Configuration and passwords
??? docker-compose.yml       # Service definitions
??? server/
    ??? Dockerfile           # Build instructions
    ??? entrypoint.sh        # Runtime config generator
    ??? app.js               # Node.js auto-restart supervisor
    ??? package.json         # Node.js dependencies (iconv-lite)
    ??? mysql.ini.tmpl       # Template for database connection
    ??? omp-server           # OMP Linux binary
    ??? gamemodes_dev/       # Directory for .amx compilation
```

## ?? Configuration

### 1. Environment Variables (`.env`)

Create a `.env` file in the root directory. This file stores your sensitive credentials and toggles development mode.

```env
isDev=1
DATABASE_USER=mitya
DATABASE_PASSWORD=your_password
DATABASE_DBNAME=server_roleplay
DATABASE_ROOT_PASSWORD=your_ultra_secure_root_password
```

2. Database Template (server/mysql.ini.tmpl)
Ётот шаблон используетс€ дл€ генерации конфига:

[mysql]
hostname = ${MYSQL_CONNECT_HOST}
username = ${MYSQL_CONNECT_USER}
password = ${MYSQL_CONNECT_PASS}
database = ${MYSQL_CONNECT_DBNAME}
port = ${MYSQL_CONNECT_PORT}

## ?? Deployment

### 1. Prepare Permissions
Ensure your scripts and binaries have executable permissions before building:

```bash
    chmod +x server/entrypoint.sh server/omp-server
```
2. Build and Start
Run the containers in detached mode:

```bash
docker-compose up -d --build
```
3. Monitor Logs
To see the OMP console and auto-restart triggers in real-time:
```bash
docker logs -f server_omp
```
### ?? Hot-Reload Logic (isDev)
The system is optimized for active Pawn development. When isDev=1 is set in your .env:
Watch: Node.js monitors changes to ./server/gamemodes_dev/new.amx.
Trigger: Upon successful compilation, the supervisor detects the file change.
Update: It automatically copies the updated .amx to the live gamemodes/ folder.
Restart: The omp-server process is killed and restarted after a 7-second delay to ensure the UDP port is fully freed.

### ?? Important Notes
Encoding: The supervisor uses iconv-lite to handle CP1251 encoding, ensuring Russian text displays correctly in the Docker console.
Persistence: Your database data is stored in the mysql_data volume and will not be lost if the container is stopped or deleted.

