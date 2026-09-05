Drop lesson recordings here, then point the `video` fence at them in plan.md:

    ```video
    title: Provisioning the Meridian dataset
    duration: 6 min
    src: /media/genie-agents/00-provisioning.mp4
    poster: /media/genie-agents/00-provisioning.jpg
    ```

Until `src` is set to a real path the block renders as a reserved slot of the
same size, so adding the file later does not reflow the lesson.

A YouTube or Vimeo URL works in `src` too, and renders their embed instead.
Prefer that for anything large: Render's free tier serves this directory from
the app itself, so a 200MB file is 200MB of every cold start.
