// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2015-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

loadAPI (1);
//load ("Config.js");
load ("framework/ClassLoader.js");
load ("launchcontrol/ClassLoader.js");
//load ("view/ClassLoader.js");

// This is the only global variable, do not use it.
var controller = null;

host.defineController("Novation","LaunchControlXL","1.0",
                      "d9185a20-c531-11e6-9598-0800200c9a66");
host.defineMidiPorts (1, 1);

host.platformIsWindows () && host.addDeviceNameBasedDiscoveryPair (["LaunchControl XL"], ["LaunchControl XL"]);
host.platformIsLinux () && host.addDeviceNameBasedDiscoveryPair (["LaunchControl XL"], ["LaunchControl XL"]);
host.platformIsMac () && host.addDeviceNameBasedDiscoveryPair (["LaunchControl XL"], ["LaunchControl XL"]);

function init ()
{
    controller = new LaunchControlXL();

    println ("Initialized.");
}

function exit ()
{
    controller.shutdown ();
}

function flush ()
{
    controller.flush ();
}
