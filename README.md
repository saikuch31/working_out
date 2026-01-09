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
