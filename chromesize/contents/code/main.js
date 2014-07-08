/********************************************************************
 KWin - the KDE window manager
 This file is not part of the KDE project.

Copyright (C) 2014 Thomas Lübking <thomas.luebking@gmail.com>, Vladimir Mityukov <mityukov@gmail.com>

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*********************************************************************/

var RELEVANT = ["chromium", "google-chrome", "google-chrome-stable"];
var EXCLUDED = ["^chrome-devtools", "^Developer Tools"];
var MAX_WIDTH = 1412;
var lastAdded;

function matchesRegExp(element, index, array) {
  var r = new RegExp(element);
  return r.test(this);
}

var fixGgeometry = function() {

    var area = workspace.clientArea(KWin.PlacementArea, workspace.activeScreen, workspace.currentDesktop);
    if (area.width < MAX_WIDTH) { // "small screen"

      // re-check active client:
      var activeClient = workspace.activeClient;
      if (activeClient != lastAdded)
      workspace.activeClient = lastAdded;
	
      var geo = lastAdded.geometry;
        geo.x = area.x;
        geo.y = area.y;
        lastAdded.geometry = geo;
        workspace.slotWindowMaximize();
        if (activeClient != lastAdded)
            workspace.activeClient = activeClient;

    } else { // big screen -> MAX_WIDTH x full height

        var geo = lastAdded.geometry;
        geo.width = MAX_WIDTH;
        geo.height = area.height;
        // center - it's likely 0x0 otherwise
        geo.x = area.x;
        geo.y = area.y;
        lastAdded.geometry = geo;
    }
};

var geometryFix = new QTimer;
geometryFix.singleShot = true;
geometryFix.timeout.connect(fixGgeometry);
workspace.clientAdded.connect(
    function(client) {

        if ( RELEVANT.indexOf(client.resourceClass.toString()) > -1
         && !EXCLUDED.some(matchesRegExp, client.caption) )
	{            
            lastAdded = client;
            var geo = client.geometry;
            geo.width = 600; // explicit width -> ensure the client isn't maximized
            client.geometry = geo;
            geometryFix.start(1); // wait until the client is actually mapped and activ(atabl)e
        }
    }
);