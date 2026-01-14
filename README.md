# working_out
A workout activity monitor app, learning next.js

day 1 -- i set out the groundwork app structure,
        latest/
            app/
                api folder/
                dashboard/
                history/
                log/
        components/
        prisma* (database schema? not really sure what's going on there)
        lot of other config and js files
01/04

day 2 -- i updated the schema so i can track multiple different exercises in a specific day. before, i could only do 1 exercise per day but i updated the model so it's more like an array. exercises can go into each workout. i want to create a cache? of frequent exercises and stuff
and i want to work on the ui

day 3 -- i added tagging to each workout, which will help me get better analytics, and updated schema and routing. Basically for now, if i name the workout "back and biceps" the routing should recognize the key words "back", "biceps" and tags them. 

day 4 -- i fell off horrifically. i added a sports section for the days i choose to play sports instead of working out. this sports section records the duration and the intensity. i wonder what else to add, maybe tagging for sports. i also updated the tagging to each exercise instead of each workout, so if i put in "leg extension" it will tag the workout with "quads", which is nice. 

day 5 -- i updated the ui drastically, and now i'm able to edit and delete workouts, which is good. simple ui clean up, simple colors, i want to add heroicons at some point. 

day 7 -- i added a workout streak counter and an activity streak counter, and i also decided to store past workouts on a different page so the dashboard is less cluttered. also decided to update the dashboard ui once again, activity heatmap per month, and updated ui to input an activity. 

day 8 -- dark mode. LGTM
