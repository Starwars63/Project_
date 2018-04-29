import { isArray } from 'min-dash';


/**
 * Reconnect connection handler
 */
export default class ReconnectConnectionHandle {
  constructor(){} 

static $inject :any = [ ];

execute = function(context:any) {

  let  newSource = context.newSource,
      newTarget = context.newTarget,
      connection = context.connection,
      dockingOrPoints = context.dockingOrPoints,
      oldWaypoints = connection.waypoints,
      newWaypoints;

  if (!newSource && !newTarget) {
    throw new Error('newSource or newTarget are required');
  }

  if (newSource && newTarget) {
    throw new Error('must specify either newSource or newTarget');
  }

  context.oldWaypoints = oldWaypoints;

  if (isArray(dockingOrPoints)) {
    newWaypoints = dockingOrPoints;
  } else {
    newWaypoints = oldWaypoints.slice();

    newWaypoints.splice(newSource ? 0 : -1, 1, dockingOrPoints);
  }

  if (newSource) {
    context.oldSource = connection.source;
    connection.source = newSource;
  }

  if (newTarget) {
    context.oldTarget = connection.target;
    connection.target = newTarget;
  }

  connection.waypoints = newWaypoints;

  return connection;
};

revert = function(context:any) {

  let  newSource = context.newSource,
      newTarget = context.newTarget,
      connection = context.connection;

  if (newSource) {
    connection.source = context.oldSource;
  }

  if (newTarget) {
    connection.target = context.oldTarget;
  }

  connection.waypoints = context.oldWaypoints;

  return connection;
};
}