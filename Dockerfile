# PQC crypto-policies builder
FROM registry.access.redhat.com/ubi9/ubi-minimal:9.8 AS crypto-builder
RUN microdnf install -y crypto-policies-scripts && \
    update-crypto-policies --set DEFAULT:PQ && \
    microdnf clean all && rm -rf /var/cache/*

FROM localhost/local-front-build:latest AS web-builder

ARG TARGETARCH
FROM docker.io/library/golang:1.26 AS go-builder

ARG TARGETARCH=amd64
ARG LDFLAGS

WORKDIR /opt/app-root

COPY go.mod go.mod
COPY go.sum go.sum
COPY vendor/ vendor/
COPY cmd/ cmd/
COPY pkg/ pkg/

RUN CGO_ENABLED=0 GOARCH=$TARGETARCH go build -ldflags "$LDFLAGS" -mod vendor -o plugin-backend cmd/plugin-backend.go

FROM --platform=linux/$TARGETARCH registry.access.redhat.com/ubi9/ubi-minimal:1785339196

COPY --from=crypto-builder /etc/crypto-policies/ /etc/crypto-policies/
COPY --from=web-builder /opt/app-root/web/dist ./web/dist
COPY --from=go-builder /opt/app-root/plugin-backend ./
USER 65532:65532

ENTRYPOINT ["./plugin-backend"]
