function physicsStep(pos, vel, totalAcc, dt) {
    // Update velocity based on total acceleration and time step
    const newVel = vel.add(totalAcc.multiply(dt));

    // Update position based on new velocity and time step
    const newPos = pos.add(newVel.multiply(dt));

    return { newPos, newVel };
}