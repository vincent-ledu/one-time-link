function delay() {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve(42);
    }, 3000);
  });
}

delay().then((val) => console.log(val));
