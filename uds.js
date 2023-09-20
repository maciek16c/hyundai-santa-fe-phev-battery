function setup ()
{
    host.log("Example script 1.0");
    host.setTickInterval(10);
    uds.setFilter(0x7EC, 0x7FF, 0);
    host.addParameter("enable_uds")

}

var enable_uds =1;
var received =1;
var counter = 0;
var id = 0x101;

function int16(v) {
    return (v << 16) >>16;
}

function gotUDSMessage(bus, id, service, subFunc, len, data)
{
received =1;
var data_id = data[1]*256+data[2];
if(data_id==0x101){
	var soc = data[7]/2;
	var max_regen = (data[8]*256+data[9])/100;
	var max_power = (data[10]*256+data[11])/100;
	var contactor_11 = data[12];
	var battery_current = int16((data[13]*256+data[14]))/10;
	var battery_voltage = (data[15]*256+data[16])/10;
	var battery_max_temp = data[17];
	var battery_min_temp = data[18];
	var battery_temp1 = data[19];
	var battery_temp2 = data[20];
	var battery_temp3 = data[21];
	var battery_temp4 = data[22];
	var battery_inlet_temp = data[25];
	var max_cell_voltage = data[26]/50;
	var max_cell_voltage_nr = data[27];
	var min_cell_voltage = data[28]/50;
	var min_cell_voltage_nr = data[29];
	var lv_battery_voltage = data[32];
	var cumulative_charge_current = (data[33]*(2^24)+data[34]*(2^16)+data[35]*(2^8)+data[36])/10;
	var cumulative_discharge_current = (data[37]*(2^24)+data[38]*(2^16)+data[39]*(2^8)+data[40])/10;
	var cumulative_energy_charged = (data[41]*(2^24)+data[42]*(2^16)+data[43]*(2^8)+data[44])/10;
	var cumulative_energy_discharged = (data[45]*(2^24)+data[46]*(2^16)+data[47]*(2^8)+data[48])/10;
	var op_time = data[49]*(2^24)+data[50]*(2^16)+data[51]*(2^8)+data[52];
	var ignition = data[53];
	var inv_cap_voltage = data[54]*(2^8)+data[55]
	var rpm_1 = data[56]*(2^8)+data[57];
	var rpm_2 = data[58]*(2^8)+data[59]
	var isolation_resistance = data[60]*(2^8)+data[61]
	host.log("Soc: " + soc.toString(10) + " Relay: " + contactor_11.toString(2) + " RPM 1: " + rpm_1.toString(10) +" RPM 2: " + rpm_2.toString(10) + " Hv: " + battery_voltage.toString(10)+ " Current: "+ battery_current.toString(10) + " Max regen: " +  max_regen.toString(10)  +" Max pwr: " +  max_power.toString(10)+" Ign: "+ignition.toString(2) + "  inv_v: " + inv_cap_voltage.toString(10) + " iso_r: " + isolation_resistance.toString(10)  + " max_temp: " + battery_max_temp.toString(10));
}
/*    if(data_id==0x105){
	var max_regen = (data[19]*256+data[20])/100;
	var max_power = (data[21]*256+data[22])/100;
	host.log(" Max regen: " +  max_regen.toString(10)  +" Max pwr: " +  max_power.toString(10) );
    }*/

}

function tick()
{
  if(enable_uds == 1  &&  received ==1){
    uds.sendUDS(0, 0x7e4, 0x22, 2,id, 0, 0);
    received = 0;
    id +=1;
    if (id >0x105) id=0x101;
  }
counter +=1;
  if (counter >100) {
    received =1;
    counter=0;
  }
}