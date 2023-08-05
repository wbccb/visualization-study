class EventListener {
  constructor(id) {
    this.callback = {};
    this.id = id;
  }

  onEvent(type, fn) {
    console.log(this.id, "注册了", type);
    if (!this.callback[type]) {
      this.callback[type] = [fn];
    } else {
      this.callback[type].push(fn);
    }
  }

  emitEvent(type, data) {
    console.log(this.id, "触发了", type);
    if (this.callback[type]) {
      const fnArray = this.callback[type];
      for (const fn of fnArray) {
        fn.call(this, data);
      }
    }
  }

  destroy() {}
}

export default EventListener;
