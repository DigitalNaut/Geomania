if (this.isNull) return;
if (!['Oceania', 'Europe'].includes(this.properties.CONTINENT))
  return (this.properties = this.properties);

if (this.properties.LABEL_X < -90) {
  this.properties.LABEL_X += 360;
}

this.properties = this.properties;
