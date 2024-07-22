// class LabelEncoder {
//   constructor() {
//     this.mapping = {};
//   }

//   fit(values) {
//     values.forEach((value, index) => {
//       if (!(value in this.mapping)) {
//         this.mapping[value] = index;
//       }
//     });
//   }

//   transform(values) {
//     return values.map((value) => this.mapping[value] ?? -1);
//   }

//   inverseTransform(values) {
//     const inverseMapping = Object.fromEntries(
//       Object.entries(this.mapping).map(([key, value]) => [value, key])
//     );
//     return values.map((value) => inverseMapping[value] ?? null);
//   }
// }

// export { LabelEncoder };
