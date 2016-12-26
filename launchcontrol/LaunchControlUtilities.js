function knobValue(v) {
  var hex = COLORS.OFF;
  if(v > 0 && v < 32) {
    hex = COLORS.GREEN_FULL;
  } else if(v >= 32 && v < 64) {
    hex = COLORS.YELLOW;
  } else if(v >= 64 && v < 96) {
    hex = COLORS.AMBER_FULL;
  } else if(v >= 96) {
    hex = COLORS.RED_FULL;
  }
  return hex;
}

