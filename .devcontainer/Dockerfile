FROM node:18

# Install basic development tools
RUN apt update && apt install -y less man-db sudo vim

# Ensure default `node` user has access to `sudo`
ARG USERNAME=node
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Install Python for scripts
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Set `PYTHONPATH` to help locate modules
ENV PYTHONPATH=/workspaces/${localWorkspaceFolderBasename}/attached_assets

# Set the working directory
WORKDIR /workspaces/${localWorkspaceFolderBasename}

# Set default shell
ENV SHELL /bin/bash