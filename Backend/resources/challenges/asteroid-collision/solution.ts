function asteroidCollision(asteroids: number[]): number[] {
  const stack: number[] = [];
  
  for (let ast of asteroids) {
    let exploded = false;
    
    // Collision only happens when current is moving LEFT (-) 
    // and the previous on stack is moving RIGHT (+)
    while (stack.length > 0 && ast < 0 && stack[stack.length - 1] > 0) {
      const top = stack[stack.length - 1];
      
      if (Math.abs(ast) > Math.abs(top)) {
        // Current is bigger, top of stack explodes
        stack.pop();
        continue;
      } else if (Math.abs(ast) === Math.abs(top)) {
        // Both equal size, both explode
        stack.pop();
        exploded = true;
        break;
      } else {
        // Current is smaller, it explodes
        exploded = true;
        break;
      }
    }
    
    if (!exploded) {
      stack.push(ast);
    }
  }
  
  return stack;
}
