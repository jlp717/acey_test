## Initial Cost Plan

| Item | Estimated Cost |
|------|---------------|
| Prototype sensors: 5x MPU-6050 IMU | $50 |
| Prototype sensors: 5x u-blox NEO-7 GPS | $100 |
| Additional sensors/reserves | $1,850 |
| Cloud services (Lightsail $100/mo, Firebase $50/mo, S3 $50/mo) | $3,000 |
| Tools: LabelStudio | $1,000 |
| Tools: IDE (VS Code Pro) | $500 |
| Misc expenses (court rental, licenses) | $3,500 |

Estimated initial budget totals **$10,000**, aligning with the breakdown in `architecture.md`.

### Migration Path
- Begin on Firebase and Lightsail for low cost.
- Export Firestore data to RDS and redeploy services to ECS and SageMaker when usage increases.

### Funding Strategy
- Seek early investors with a subscription model around **$10/month/user** to cover ongoing cloud costs.
