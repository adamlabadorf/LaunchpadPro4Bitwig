SYSEX_HEADER = "F00020290211";

LAUNCHCONTROL_BUTTONS_ALL = [];

NUM_TRACKS      = 8;
NUM_SENDS       = 2;
NUM_SCENES      = 0;
MIDI_ON         = 0;
MIDI_OFF        = 1;
MIDI_CNTL       = 3;
CNTL_SEND_A     = 0;
CNTL_SEND_B     = 1;
CNTL_PAN        = 2;
CNTL_SLIDE      = 3;
CNTL_FOCUS      = 4;
CNTL_CONTROL    = 5;

var COLORS = {
  OFF: "0C",
  RED_LOW: "0D",
  RED_FULL: "0F",
  AMBER_LOW: "1D",
  AMBER_FULL: "3F",
  YELLOW: "3E",
  GREEN_LOW: "1C",
  GREEN_FULL: "3C"
}

var PAD_TO_INDEX = {
  41: 24,
  42: 25,
  43: 26,
  44: 27,
  57: 28,
  58: 29,
  59: 30,
  60: 31,
  73: 32,
  74: 33,
  75: 34,
  76: 35,
  89: 36,
  90: 37,
  91: 38,
  92: 39
}

var LaunchControlXL = function() {

  var input = new MidiInput();
  var output = new MidiOutput();

  AbstractControlSurface.call (this, output, input, LAUNCHCONTROL_BUTTONS_ALL);

  // midi signal reference
  // http://www.midimountain.com/midi/midi_status.htm
  //
  // launch control xl programming guide
  // https://d19ulaff0trnck.cloudfront.net/sites/default/files/novation/downloads/9922/launch-control-xl-programmers-reference-guide.pdf
  //
  // create an object that will help map surface controls
  // to the appropriate track
  // channelGroup is the high level groups (note on, note off, etc)
  // channelId is the channel number within the group (e.g. 0-15)
  // 128-143 maps to [0,0-15]
  // 144-159 maps to [1,0-15]
  // etc.
  statusMap = {}
  for(var status=128; status < 240; status++) {
      statusMap[status] = {
          channelGroup: Math.floor((status-128)/16),
          channelId: status % 16
      }
  }

  // map the controller values to sends and tracks
  // track map contains channel group as top level object
  // each channel group object has data1:{controlTypeId:control type id,trackId:track id}
  trackMap = {}

  // Control/Mode change (status 176-191, channelGroup == 3) mapping
  // 13-20 - send a, control type id = 0
  // 29-36 - send b, control type id = 1
  // 49-56 - pan, control type id = 2
  // 77-84 - sliders, control type id = 3
  var starts = [[13,8],[29,8],[49,8],[77,8]];
  cntl = trackMap[MIDI_CNTL] = {}
  for(var i=0; i < starts.length; i++) {
      start = starts[i][0];
      num = starts[i][1];
      for(var j=0; j < num; j++) {
          cntl[start+j] = {controlTypeId:i,trackId:j};
      }
  }

  // Note on/ Note off (status 128-143 and 144-159, channelGroup in [0,1])
  // 41-60 - id:4 track focus
  // 73-92 - id:5 track control
  starts = [[41,4],[57,4]]
  noteon = trackMap[MIDI_ON] = {};
  noteoff = trackMap[MIDI_OFF] = {};
  for(var i=0; i < starts.length; i++) {
      start = starts[i][0];
      num = starts[i][1];
      for(var j=0; j < num; j++) {
          noteon[start+j] = {controlTypeId:CNTL_FOCUS,trackId:j};
          noteoff[start+j] = {controlTypeId:CNTL_FOCUS,trackId:j};
      }
  }
  starts = [[73,4],[89,4]];
  for(var i=0; i < starts.length; i++) {
      start = starts[i][0];
      num = starts[i][1];
      for(var j=0; j < num; j++) {
          noteon[start+j] = {controlTypeId:CNTL_CONTROL,trackId:j};
          noteoff[start+j] = {controlTypeId:CNTL_CONTROL,trackId:j};
      }
  }

  transport = host.createTransport();
  userControls = host.createUserControls(8);
  trackBank = host.createTrackBank(NUM_TRACKS, NUM_SENDS, NUM_SCENES);

  //output = host.getMidiOutPort(0);

  println("Initialized.");

  /*
  for(var t=0; t<NUM_TRACKS; t++) {
      trackBank.getTrack(t).addNameObserver(8, "", closure(t,
          function (name) {
              println("Track " + t + " name: " + name);
          }
      )
      )
  }
  */

  //host.getMidiInPort(0).setMidiCallback(onMidi);

}
LaunchControlXL.prototype.shutdown = function() {
  // stub
}
LaunchControlXL.prototype.flush = function() {
  // stub
}
LaunchControlXL.prototype = new AbstractControlSurface();

LaunchControlXL.prototype.handleMidi = function(status, data1, data2) {

  statusProps = statusMap[status];
  this.channelGroup = statusProps.channelGroup;
  this.channelId = statusProps.channelId;

  //println("status: " + status);
  //println("data1: " + data1);
  //println("data2: " + data2);

  var code = status & 0xF0;
  switch (code) {
    // Note off/on
    case 0x80:
      this.handlePadOff (data1, data2);
      break;
    case 0x90:
      this.handlePadOn (data1, data2);
      break;
    // CC
    case 0xB0:
      this.handleCC (data1, data2);
      break;
  }

}
LaunchControlXL.prototype.padEventToIndex = function(cc) {
  return PAD_TO_INDEX[cc];
}
LaunchControlXL.prototype.handlePadOn = function(cc, value) {

  trackProps = trackMap[MIDI_ON][cc];

  if(trackProps.controlTypeId == CNTL_FOCUS) {
      track = trackBank.getTrack(trackProps.trackId);
      track.selectInMixer();
  }

  this.setLEDColor(toHexStr([PAD_TO_INDEX[cc]]),toHexStr([value]));

}

LaunchControlXL.prototype.handlePadOff = function(cc, value) {

  trackProps = trackMap[MIDI_OFF][cc];

  this.setLEDColor(toHexStr([PAD_TO_INDEX[cc]]),toHexStr([value]));
}
LaunchControlXL.prototype.handleCC = function(cc, value) {

  trackProps = trackMap[MIDI_CNTL][cc];
  track = trackBank.getTrack(trackProps.trackId);

  //println("channelGroup: " + statusProps.channelGroup);
  //println("channelId: " + statusProps.channelId);

  //println("controlTypeId: " + trackProps.controlTypeId)
  //println("trackId: " + trackProps.trackId)

  // factory is on channel 9
  if(statusProps.channelId == 8) {
      if(trackProps.controlTypeId == CNTL_SEND_A ||
         trackProps.controlTypeId == CNTL_SEND_B) {
          track.getSend(trackProps.controlTypeId).set(value,128);
      }
      else if(trackProps.controlTypeId == CNTL_PAN) {
          track.getPan().set(value,128);
      }
      else if(trackProps.controlTypeId == CNTL_SLIDE) {
          track.getVolume().set(value,128);
      }
  }

  // sliders have no LED
  if(trackProps.controlTypeId != CNTL_SLIDE) {
    index = toHexStr([trackProps.controlTypeId*8 + trackProps.trackId]);
    value = knobValue(value);
    this.setLEDColor(index,value);
  }
}
LaunchControlXL.prototype.setLEDColor = function(index,value) {
  template = toHexStr([this.channelId]);
  sysex = SYSEX_HEADER + "78" + template + index + value + "F7";
  this.output.sendSysex(sysex)
}
