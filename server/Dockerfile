FROM ubuntu:22.04

RUN dpkg --add-architecture i386 && \
    apt update && \
    apt upgrade -y && \
    apt install -y \
        libfontconfig1:i386 \
        libx11-6:i386 \
        libxrender1:i386 \
        libxext6:i386 \
        libgl1-mesa-glx:i386 \
        libglu1-mesa:i386 \
        libglib2.0-0:i386 \
        libsm6:i386 \
        lib32stdc++6 \
        wget \
        curl \
        nodejs \
        npm \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /home/omp
COPY . .
RUN cp entrypoint.sh /entrypoint.sh
RUN chmod +x /home/omp/omp-server
RUN chmod +x /entrypoint.sh

EXPOSE 7777/udp
EXPOSE 7779/udp

ENTRYPOINT ["/entrypoint.sh"]

CMD ["node", "app.js"]
