/**
 * A component that handles language switching in a unified way.
 *
 * @param {EventBus} eventBus
 */
export default class I18N{
constructor(eventBus:any) {

  /**
   * Inform components that the language changed.
   *
   * Emit a `i18n.changed` event for others to hook into, too.
   */
 this.changed = function changed() {
    eventBus.fire('i18n.changed');
  };



}
 changed:any ;

static $inject = [ 'eventBus' ];
}