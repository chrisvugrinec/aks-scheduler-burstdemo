FROM ubuntu:14.04

RUN apt-get update \
        && apt-get upgrade -y \
        && apt-get install -y unzip wget build-essential \
                cmake git pkg-config libswscale-dev \
                python3-dev python3-numpy python3-pip \
                libtbb2 libtbb-dev libjpeg-dev libffi-dev \
                libpng-dev libtiff-dev libjasper-dev libssl-dev \
                python-opencv \
                curl apt-transport-https


RUN PYTHONPATH=/usr/lib/python3.0
RUN export $PYTHONPATH
RUN #!/bin/bash ~/.bashrc

RUN cd \
        && wget https://github.com/opencv/opencv/archive/3.1.0.zip \
        && unzip 3.1.0.zip \
        && cd opencv-3.1.0 \
        && mkdir build \
        && cd build \
        && cmake .. \
        && make -j3 \
        && make install \
        && cd \
        && rm 3.1.0.zip \
        && rm -rf opencv-3.1.0

RUN AZ_REPO=$(lsb_release -cs) \
    && echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $AZ_REPO main" | sudo tee /etc/apt/sources.list.d/azure-cli.list \
    && curl -L https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add - \
    && apt-get update && sudo apt-get install azure-cli

COPY ./app/requirements.txt .
RUN pip3 install -r ./requirements.txt

COPY app/ /app
WORKDIR /app
CMD ["python3", "imagegenerator.py"]
