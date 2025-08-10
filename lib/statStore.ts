export interface PointRecord {
  start: number
  end?: number
}

export interface ServeRecord {
  speed: number
  timestamp: number
}

export interface TrajectoryRecord {
  positions: { x: number; y: number; time: number }[]
}

class StatStore {
  points: PointRecord[] = []
  serves: ServeRecord[] = []
  trajectories: TrajectoryRecord[] = []

  startPoint() {
    this.points.push({ start: Date.now() })
  }

  endPoint() {
    const p = this.points[this.points.length - 1]
    if (p && !p.end) p.end = Date.now()
  }

  recordServe(speed: number) {
    this.serves.push({ speed, timestamp: Date.now() })
  }

  recordTrajectory(positions: { x: number; y: number; time: number }[]) {
    this.trajectories.push({ positions })
  }
}

export const statStore = new StatStore()
