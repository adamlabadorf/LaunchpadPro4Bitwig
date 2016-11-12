// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function VolumeView (model)
{
    if (model == null)
        return;
    
    AbstractFaderView.call (this, model);
}
VolumeView.prototype = new AbstractFaderView ();

VolumeView.prototype.onFader = function (index, value)
{
    this.model.getCurrentTrackBank ().setVolume (index, value);
};

VolumeView.prototype.drawGrid = function () 
{
    for (var i = 0; i < 8; i++)
    {
        var track = this.model.getCurrentTrackBank ().getTrack (i);
        
        if (this.trackColors[i] != track.color || !track.exists)
            this.setupFader (i);
        
        this.trackColors[i] = track.color;
        
        this.surface.output.sendCC (LAUNCHPAD_FADER_1 + i, track.volume);
    }
};

VolumeView.prototype.updateSceneButtons = function (buttonID)
{
    var track = this.model.getMasterTrack ();
    var sceneMax = Math.floor (9 * track.volume / Config.maxParameterValue);
    for (var i = 0; i < 8; i++)
        this.surface.setButton (LAUNCHPAD_BUTTON_SCENE8 + 10 * i, i < sceneMax && track.color != null ? track.color : LAUNCHPAD_COLOR_BLACK);
};

VolumeView.prototype.onScene = function (scene, event)
{
    if (!event.isDown ())
        return;
    var track = this.model.getMasterTrack ();
    track.setVolume (Math.min (127, Math.floor ((7 - scene) * Config.maxParameterValue / 7)));
};
