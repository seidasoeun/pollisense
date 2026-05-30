FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /workspace
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw -q -DskipTests dependency:go-offline
COPY src src
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN groupadd --system pollisense && useradd --system --gid pollisense pollisense
COPY --from=build /workspace/target/pollisense-backend-0.0.1-SNAPSHOT.jar app.jar
USER pollisense
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
