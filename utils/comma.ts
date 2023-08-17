export default (n: number): string =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
