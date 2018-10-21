/*
All imports are like React singleton components, where only one instance
exists, and every reference to it will "use" the same instance. So it
essentially works like global variables, but for classes instead.

Example: If you change some data in ComandLog from CommandLine, SongList will
be able to access that data in CommandLog as well, but the data will still be
changed to what CommandLine changed it to.

This script exists only to initially load all the components in a centralized
location (also to guarantee the scripts loading, even though some components
will be imported, referred to and/or modified in other components).

This script is ONLY to load the components. Nothing should be modified or run
from here (modifications are supposed to be triggered by user events in other
scripts).
*/

require('./components/Titlebar');
require('./components/CommandLog');
require('./components/CommandLine');
require('./components/SongList');
require('./components/Settings');