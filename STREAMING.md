# Streaming setup

How to set up the streaming laptop for HackAthlone 2026: the graphics from this repo, OBS, and the live stream on the [@SpaceAppsAthlone](https://www.youtube.com/@SpaceAppsAthlone) YouTube channel. It takes about 45 minutes the first time.

The stream also plays on [hackathlone.com/live](https://hackathlone.com/live).

## What you need

- **The streaming laptop:** Windows, Mac or Linux, plugged into power.
- **A camera:** a USB webcam, a camera with an HDMI capture card, or a phone used as a webcam.
- **The slides:** an HDMI capture card on the presenters' laptop or the projector feed, or present from the streaming laptop itself.
- **Sound:** a USB microphone, or the room's sound desk into a USB audio interface.
- **Internet:** wired if possible, with at least 10 Mbps upload. Check at [fast.com](https://fast.com) (click "Show more info").
- **The stream key "HackAthlone 2026":** Manav sends it to you. Never show it on screen or post it in a chat.

## 1. Start the graphics

1. Install [Node.js](https://nodejs.org) 22 or newer (the LTS button).
2. Get this repo: **Code > Download ZIP** and unzip it, or `git clone https://github.com/themanavshah/hackathlone-broadcast.git`.
3. Start the graphics studio:
   - **Windows:** double-click `start.cmd`.
   - **Mac or Linux:** open a terminal in the folder and run `npm start`.
4. Open the control panel at **http://127.0.0.1:3131**.

Keep that terminal window open for the whole broadcast. If it closes, the graphics stop.

The control panel has no password. It only works on this laptop. Never put it on the internet.

## 2. Set up OBS

1. Install [OBS Studio](https://obsproject.com) and close it.
2. In the repo folder, run this with the encoder for your laptop:

   ```sh
   node obs/setup-obs.mjs --install --encoder x264
   ```

   | Laptop | Encoder |
   | --- | --- |
   | NVIDIA graphics | `nvenc` |
   | Intel graphics | `qsv` |
   | AMD graphics | `amd` |
   | Mac | `apple_h264` |
   | Not sure | `x264` |

3. Open OBS. Pick **Profile > HackAthlone 2026** and **Scene Collection > HackAthlone 2026**.

   If the script doesn't run, import the files by hand instead:
   - **Profile:** Profile > Import, then pick the `obs/HackAthlone_2026` folder.
   - **Scene collection:** Scene Collection > Import, then pick `obs/HackAthlone_2026.json`.
4. There are two scenes, **Camera** and **Slides**. Each has **HackAthlone graphics** on top.
5. **Camera scene:**
   1. Add the camera under Sources: **+ > Video Capture Device**, pick the camera, then **OK**.
   2. Move it below HackAthlone graphics. Select it and click the down arrow.
   3. Right-click it and choose **Transform > Fit to screen**.
6. **Slides scene:**
   1. Add the slides:
      - **Video Capture Device** for an HDMI capture card.
      - **Display Capture** or **Window Capture** if the slides run on this laptop.
   2. Move the slides below the graphics and choose **Fit to screen**.
   3. To show the speaker too, add the camera again, small in a corner.
7. **Sound:**
   1. Go to **Settings > Audio > Mic/Auxiliary Audio** and pick the microphone or audio interface.
   2. Set **Desktop Audio** to Disabled, unless the slides play sound.
   3. Speak normally. The Mic meter should peak in the yellow, never the red.
8. **Check the settings:**
   - **Settings > Video:** Base and Output should both be **1920x1080**, at **30** fps.
   - **Settings > Output:** Video Bitrate should be **6000** Kbps.
   - **On slow internet:** use **3500** Kbps and an Output of **1280x720**.

## 3. Connect YouTube

1. Go to **Settings > Stream**.
2. Set Service to **YouTube - RTMPS** and Server to **Primary YouTube ingest server**.
3. Click **Use Stream Key**, paste the key from Manav, then **Apply**.

   Don't use **Connect Account** on a shared laptop.

The key is linked to one broadcast at a time: the Opening Ceremony on Friday, then Final Presentations and Awards on Sunday. **Start Streaming puts that broadcast live straight away.** So only press it when you mean it.

## 4. Before going live

Do this 30 minutes before.

- [ ] The studio terminal is running and the panel opens.
- [ ] OBS shows the camera with the HackAthlone corner mark on top.
- [ ] The upload speed is at least 10 Mbps.
- [ ] The laptop is on power, with sleep, notifications and other apps off.
- [ ] Recording is running as a backup: click **Start Recording** in OBS.
- [ ] 15 minutes before the start:
  1. In the panel, pick the **Starting soon** scene and start a **Countdown** to the start time.
  2. Click **Start Streaming** in OBS.
- [ ] Manav or a helper checks the stream on YouTube with headphones: the picture, the sound and the health in YouTube Studio.

## 5. Running the show

Everything on screen is controlled from the panel. **Esc** hides all graphics at once.

| Moment | Panel | OBS |
| --- | --- | --- |
| Before the start | **Starting soon** + Countdown | Start Streaming |
| The start | **Live** | Camera |
| Someone speaks | Guests & speakers > Prepare > **Take live** (it hides itself after 12 s) | Camera |
| Slides | Hide the lower third | Slides |
| A team presents (Sunday) | Teams > **Bring on stage** | Slides |
| A break | **Break** + Countdown (15 minutes) | Any |
| Partners, agenda, ticker | Turn on for a minute, then off | Any |
| The end | **Closing**, wait 30 seconds | Stop Streaming |

**Sunday, Final Presentations and Awards:**

| Time | What happens | Panel |
| --- | --- | --- |
| 11:30 | Session 1 | Live |
| 13:00 | Break | Break + Countdown, 15 min |
| 13:15 | Session 2 | Live |
| 14:45 | Break | Break + Countdown, 15 min |
| 15:00 | Session 3 | Live |
| 16:30 | Judges deliberate | Break + Countdown to 17:30 |
| 17:30 | Closing talk and awards | Live |
| 17:55 | Closing photos | Live, then Closing |

**The team list:** after the 06:00 team confirmation on Sunday, Manav sends a file with the final teams in presenting order. Load it with **Settings & OBS > Import JSON** before 11:30.

## If something goes wrong

- **No graphics in OBS:** the studio terminal closed. Run `npm start` again. Then right-click **HackAthlone graphics** in OBS and choose **Refresh**.
- **A red square in OBS, or "dropped frames":** the internet can't keep up.
  1. Lower the bitrate to 3500 and the output to 1280x720.
  2. Use a cable instead of Wi-Fi.
- **YouTube shows "no data":**
  1. Check the key and that the service is **YouTube - RTMPS**.
  2. As a last resort, try a phone hotspot.
- **Echo or howling:** disable Desktop Audio and don't play the stream through speakers in the room.
- **You need to stop fast:** press **Esc** in the panel to clear the graphics, then **Stop Streaming** in OBS.

## After the stream

1. Click **Stop Streaming**. YouTube ends the broadcast by itself and keeps the recording on the channel.
2. Click **Stop Recording**. The backup is in your Videos folder (Movies on a Mac).
3. Leave the studio running if there's another stream that day. Otherwise close the terminal.
