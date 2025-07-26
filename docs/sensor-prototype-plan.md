# Sensor Prototype Plan

## Sensor Selection
- **MPU-6050**: ~$10, ±0.1g precision
- **Bosch BMI323**: ~$5, ±0.1g precision
- **u-blox NEO-7** GPS: ~$20, ±1m accuracy
- Scoring matrix (30% precision, 30% cost, 20% durability, 20% availability) will guide final choice.
- Parts sourced from DigiKey or Mouser.

## Prototype Setup
- Use **Arduino Nano 33 BLE** (~$25) to read sensors and transmit via BLE.
- Program with the Arduino IDE and log data to a laptop.

## Field Testing
- Mount IMU to racket and subject to **50g** vibration.
- Place GPS on ball and shoot at **100 km/h** to verify durability.
- Perform tests on a tennis court and capture metrics.
- Measurement methods include a calibrated **ADXL345** accelerometer and a high-speed camera to validate impacts.

## Timeline
- **Month 1**: research sensors and purchase components.
- **Month 2**: build BLE prototype and run field tests.

## Budget
- Approximately **$200** for sensors and Arduino hardware.

## Scalability Plan
- If additional funding is available, transition from **MPU-6050** to **Bosch BMI323** for bulk orders (~$1,000 for 100 units).

## Deliverables
- Working BLE prototype communicating with the mobile app.
- Field test report covering accuracy and durability.
