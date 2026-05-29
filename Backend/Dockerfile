# =========================
# Stage 1: build
# =========================
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Cache de dependências
COPY pom.xml .
RUN mvn -B dependency:go-offline

# Código fonte
COPY src ./src
RUN mvn -B clean package -Dmaven.test.skip=true

# =========================
# Stage 2: runtime
# =========================
FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache wget && \
    addgroup -S app && adduser -S app -G app
WORKDIR /app

COPY --from=build /build/target/*.jar app.jar

USER app
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=45s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health | grep -q '"UP"' || exit 1

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
