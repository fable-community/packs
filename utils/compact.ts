const compact = (n: number): string => {
  if (n <= 0) {
    return "0";
  }

  const units = ["", "K", "M", "G", "T", "P", "E"];
  const index = Math.floor(Math.log10(Math.abs(n)) / 3);
  const value = n / Math.pow(10, index * 3);

  const formattedValue = value.toFixed(1).replace(/\.0+$/, "");

  return formattedValue + units[index];
};

export default compact;
