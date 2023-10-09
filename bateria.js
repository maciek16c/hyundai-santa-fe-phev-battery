class CANFrame {

  constructor(bus, id, data, aliveCntBitOffset, aliveCntBitLength, checksum_present) {
    this.id = id;
    this.bus = bus;
    this.data = data;
    this.aliveCntBitOffset = aliveCntBitOffset;
    this.aliveCntBitLength = aliveCntBitLength;
    this.crc = 0;
    this.aliveCnt = 0;
    this.checksum_present = checksum_present;
  }

  calculateCRC8() {
    let crc = 0x0;
    this.data[7] = 0x0;
    for (let i = 0; i < this.data.length; i++) {
      crc ^= this.data[i];

      for (let j = 0; j < 8; j++) {
        if ((crc & 0x80) !== 0) {
          crc = (crc << 1) ^ 0x1;
        } else {
          crc <<= 1;
        }
      }
    }

    this.crc = crc & 0xFF;
  }

  send() {
    if (this.aliveCntBitLength > 0) {
      let aliveMask = ~(((1 << this.aliveCntBitLength) - 1) << this.aliveCntBitOffset % 8);
      let byte_nr = Math.floor(this.aliveCntBitOffset / 8);
      this.data[byte_nr] &= aliveMask;
      this.data[byte_nr] |= this.aliveCnt << this.aliveCntBitOffset % 8;

      this.aliveCnt += 1;
      if (this.aliveCnt >= (1 << this.aliveCntBitLength))
        this.aliveCnt = 0;
    }
    if (this.checksum_present==true){
      this.calculateCRC8();
      this.data[7] = this.crc;
    }
    can.sendFrame(this.bus, this.id, 8, this.data);
  }
}

var frame_timer = 0;

var kl15= 0;
var enable_send = 0;

var contactor1 = 0;
var contactor2 = 0;
var voltage = 255;
var contactor1_2F0 = 0;
var contactor2_2F0 = 0;

const PCAN = 0;
const HCAN = 0; //1

		//constructor(bus, id, data, aliveCntBitOffset, aliveCntBitLength, checksum_present)
var frame200 = new CANFrame(PCAN, 0x200, [0x00, 0, 0, 0x00, 0x80, 0x30, 0x00, 0], 49, 4,true);
//var frame201 = new CANFrame(PCAN, 0x201, [0, 0, 0, 0, 0, 0, 0, 0], 0, 0,true);
//var frame202 = new CANFrame(PCAN, 0x202, [0, 0, 0, 0, 0, 0, 0, 0], 0, 0,true);
//var frame203 = new CANFrame(HCAN, 0x203, [0, 0, 0, 0, 0, 0, 0, 0], 30, 2,true);
//var frame2A0 = new CANFrame(HCAN, 0x2A0, [0, 0, 0, 0, 0, 0, 0, 0], 0, 0,false);
var frame2A1 = new CANFrame(HCAN, 0x2A1, [0, 0, 0, 0, 0, 0, 0xFF, 0x02], 0, 0,false);
//var frame2A2 = new CANFrame(PCAN, 0x2A2, [0, 0, 0, 0, 0, 0, 0, 0], 0, 0,false);
//var frame2B0 = new CANFrame(PCAN, 0x2B0, [0, 0, 0, 0, 0, 0, 0, 0], 0, 0,false);
//var frame2B5 = new CANFrame(HCAN, 0x2B5, [0, 0, 0, 0, 0, 0, 0, 0], 0, 0,false);
var frame2F0 = new CANFrame(HCAN, 0x2F0, [0x01, 0, 0, 0, 0, 0, 0x40, 0], 48, 2,true);
//var frame2F1 = new CANFrame(HCAN, 0x2F1, [0, 0, 0, 0, 0, 0, 0, 0], 0, 0,false);
var frame523 = new CANFrame(PCAN, 0x523, [0x60, 0, 0x60, 0, 0, 0, 0, 0], 56, 2,false);
//var frame524 = new CANFrame(PCAN, 0x524, [0, 0, 0, 0, 0, 0, 0, 0], 0, 0,false);

function setup() {
  host.log("Bateria Santa Fe");
  host.setTickInterval(10);
  can.setFilter(0x0, 0x7FF, 0);
  host.addParameter("kl15")
  host.addParameter("enable_send")
  host.addParameter("contactor1")
  host.addParameter("contactor2")
  host.addParameter("voltage")
  host.addParameter("contactor1_2F0")
  host.addParameter("contactor2_2F0")
}

function gotCANFrame(bus, id, len, data) {
  var dataBytes = [];
}

function frame_10ms() {

if(kl15==1) {
  frame523.data[0]=0x60;
  frame523.data[2]=0x60;
}
else{
  frame523.data[0]=0x00;
  frame523.data[2]=0x00;
}

if(contactor1==1){
  frame200.data[5] |= 0x10;
}
else{
    frame200.data[5] &= ~0x10;
}

if(contactor2==1){
  frame200.data[5] |= 0x20;
}
else{
    frame200.data[5] &= ~0x20;
}


if(contactor1_2F0==1){
  frame2F0.data[0] |= 0x01;
}
else{
    frame2F0.data[0] &= ~0x01;
}

if(contactor2_2F0==1){
  frame2F0.data[6] |= 0x40;
}
else{
    frame2F0.data[6] &= ~0x40;
}

frame2A1.data[6] = voltage;

  frame200.send();
//  frame201.send();
//  frame202.send();
//  frame203.send();
//  frame2A0.send();
  frame2A1.send();
//  frame2A2.send();
//  frame2B0.send();
//  frame2B5.send();
  frame2F0.send();
//  frame2F1.send();
}

function frame_100ms() {
  frame523.send();
//  frame524.send();
}

function frame_1000ms() {

}

function tick() {
  if (enable_send==1) {
    frame_10ms();
    if (frame_timer % 10 == 0)
      frame_100ms();
    if (frame_timer % 100 == 0)
      frame_1000ms();
  }

  frame_timer += 1;
  if (frame_timer > 99)
    frame_timer = 0;
}
