/* Shared deterministic damped-pendulum integrator. No DOM or animation timing. */
(function(root){
 'use strict';
 function create(mass=1){return {mass:Math.max(.3,mass),angle:0,velocity:0};}
 function advance(state,target,dt){
  target=Math.max(-.4,Math.min(.4,target));let remaining=Math.min(.1,Math.max(0,dt));
  while(remaining>0){const h=Math.min(remaining,1/120);const force=32*(target-state.angle)-5*Math.sqrt(state.mass)*state.velocity;state.velocity+=force/state.mass*h;state.velocity=Math.max(-4,Math.min(4,state.velocity));state.angle+=state.velocity*h;if(Math.abs(state.angle)>.45){state.angle=Math.sign(state.angle)*.45;state.velocity*=-.2;}remaining-=h;}
  if(Math.abs(state.angle-target)<.00006&&Math.abs(state.velocity)<.0002){state.angle=target;state.velocity=0;}return state;
 }
 const api={create,advance};if(typeof module==='object'&&module.exports)module.exports=api;else root.MeatRackPhysics=api;
})(globalThis);
