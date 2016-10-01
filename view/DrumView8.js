// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

DrumView8.NUM_DISPLAY_COLS = 8;

function DrumView8 (model)
{
    AbstractDrumView.call (this, model, 1, 0);
    
    this.soundOffset = 0;
}
DrumView8.prototype = new AbstractDrumView ();

DrumView8.prototype.onGridNote = function (note, velocity)
{
    if (!this.model.canSelectedTrackHoldNotes () || velocity == 0)
        return;
    
    var index = note - 36;
    var x = index % 8;
    var y = Math.floor (index / 8);
    
    var sound = y +  this.soundOffset;
    var col = x;

    this.clip.toggleStep (col, this.offsetY + this.selectedPad + sound, Config.accentActive ? Config.fixedAccentValue : velocity);
};

DrumView8.prototype.drawGrid = function ()
{
    if (!this.model.canSelectedTrackHoldNotes ())
    {
        this.surface.pads.turnOff ();
        return;
    }

    // Clip length/loop area
    var step = this.clip.getCurrentStep ();
    
    // Paint the sequencer steps
    var hiStep = this.isInXRange (step) ? step % DrumView8.NUM_DISPLAY_COLS : -1;
    for (var sound = 0; sound < 8; sound++)
    {
        for (var col = 0; col < DrumView8.NUM_DISPLAY_COLS; col++)
        {
            var isSet = this.clip.getStep (col, this.offsetY + this.selectedPad + sound + this.soundOffset);
            var hilite = col == hiStep;
            var x = col % 8;
            var y = Math.floor (col / 8);
            y += sound;
            this.surface.pads.lightEx (x, 7 - y, isSet ? (hilite ? LAUNCHPAD_COLOR_GREEN_LO : LAUNCHPAD_COLOR_BLUE_HI) : hilite ? LAUNCHPAD_COLOR_GREEN_HI : LAUNCHPAD_COLOR_BLACK, null, false);
        }
    }
};

DrumView8.prototype.updateNoteMapping = function ()
{
    this.surface.setKeyTranslationTable (this.scales.translateMatrixToGrid (this.scales.getEmptyMatrix ()));
};

DrumView8.prototype.usesButton = function (buttonID)
{
    switch (buttonID)
    {
        case LAUNCHPAD_BUTTON_REPEAT:
        case LAUNCHPAD_BUTTON_ADD_EFFECT:
            return false;
    }
    
    if (Config.isPush2 && buttonID == LAUNCHPAD_BUTTON_USER_MODE)
        return false;
    
    return true;
};

DrumView8.prototype.onMute = function (event)
{
    if (event.isLong ())
        return;
    this.updateNoteMapping ();
    AbstractSequencerView.prototype.onMute.call (this, event);
};

DrumView8.prototype.onSolo = function (event)
{
    if (event.isLong ())
        return;
    this.updateNoteMapping ();
    AbstractSequencerView.prototype.onSolo.call (this, event);
};

DrumView8.prototype.updateLowerSceneButtons = function ()
{
    this.surface.setButton (LAUNCHPAD_BUTTON_SCENE8, this.soundOffset == 0 ? LAUNCHPAD_COLOR_YELLOW : LAUNCHPAD_COLOR_GREEN);
    this.surface.setButton (LAUNCHPAD_BUTTON_SCENE7, this.soundOffset == 8 ? LAUNCHPAD_COLOR_YELLOW : LAUNCHPAD_COLOR_GREEN);
    this.surface.setButton (LAUNCHPAD_BUTTON_SCENE6, LAUNCHPAD_COLOR_BLACK);
    this.surface.setButton (LAUNCHPAD_BUTTON_SCENE5, LAUNCHPAD_COLOR_BLACK);
};

DrumView8.prototype.onLowerScene = function (index)
{
    // 7, 6, 5, 4
    if (index < 6)
        return;
    this.soundOffset = index == 7 ? 0 : 8;
};
