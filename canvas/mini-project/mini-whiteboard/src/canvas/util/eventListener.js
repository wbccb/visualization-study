class EventListener {
  constructor(id = "1") {
    this.callback = {};
    this.id = id;
  }

  on(type, fn) {
    if (!this.callback[type]) {
      this.callback[type] = [fn];
    } else {
      this.callback[type].push(fn);
    }
  }

  emit(type, data) {
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
