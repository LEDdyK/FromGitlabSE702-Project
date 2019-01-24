package com.example.softeng702.mindfulness;

import android.app.Activity;
import android.content.Intent;
import android.content.res.Resources;
import android.graphics.Point;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.os.Handler;
import android.support.annotation.Nullable;
import android.support.v4.view.VelocityTrackerCompat;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.MotionEvent;
import android.view.VelocityTracker;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.RelativeLayout;
import android.graphics.Color;
import android.widget.TextView;

import com.skyfishjy.library.RippleBackground;

/**
 *
 */

public class InteractiveActivity extends Activity {

    private RelativeLayout screen;
    private Handler handler = new Handler();
    private int i = 0;
    private int centerX;
    private int centerY;
    private int naviHeight;
    private float[] hsv = {0, 0, 1f};
    private long lastTime;
    private Point lastPos;
    private MediaPlayer backAudio;

    private Button exitButton;

    private TextView drawCircleText;

    private RippleBackground rippleBackground;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // get height of the navigation bar
        Resources resources = this.getResources();
        naviHeight  = resources.getDimensionPixelSize(
                resources.getIdentifier("navigation_bar_height", "dimen", "android")
        );

        // Hide the title bar
        this.requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().getDecorView().setSystemUiVisibility( View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);

        setContentView(R.layout.activity_interactive);
        screen = (RelativeLayout) findViewById(R.id.interactive_layout);

        // set up exit button
        this.exitButton = findViewById(R.id.exitInteractive);
        this.exitButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(InteractiveActivity.this, ExitActivity.class);
                finish();
                startActivity(intent);
            }
        });

        // set up text
        this.drawCircleText = findViewById(R.id.instruction);
        //this.exitButton.setTextColor(Color.argb(255,108, 118, 131));
        this.exitButton.setTextColor(Color.argb(255,255, 255, 255));

        // get the center point of the screen
        DisplayMetrics displayMetrics = new DisplayMetrics();
        getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        centerX = displayMetrics.widthPixels/2;
        centerY = displayMetrics.heightPixels/2;

        // add background audio
        backAudio = MediaPlayer.create(this, R.raw.crisp_ocean_waves);
        backAudio.setLooping(true);

        // add ripple effect
        rippleBackground = (RippleBackground)findViewById(R.id.content);
        rippleBackground.startRippleAnimation();

        (new Thread(){
            @Override
            public void run(){
                // change the hue value of the background infinitely
                while(true) {
                    long currentTime = System.currentTimeMillis();
                    i = i < 360 ? i+1 : 0;
                    handler.post(changeColor());

                    try {
                        Thread.sleep(100);
                    }
                    catch(InterruptedException e) {
                        break;
                    }
                    // revert the saturation to 0
                    if (currentTime > lastTime+100) {
                        if (hsv[1] >= 0f){
                            // saturation and volume reaches 0 after 3s (calculate saturation rate - get saturation decrement)
                            hsv[1] -= 0.0333f;
                            backAudio.setVolume(hsv[1], hsv[1]);
                            runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    changeTextColor(hsv[1]);
                                }
                            });
                        }
                        lastTime = currentTime;
                    }
                }
            }
        }).start();
    }

    private Runnable changeColor(){
        return new Runnable() {
            @Override
            public void run() {
                hsv[0] = i;
                screen.setBackgroundColor(Color.HSVToColor(hsv));
            }
        };
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        int action = event.getActionMasked();
        long currentTime = System.currentTimeMillis();
        backAudio.start();
        backAudio.setVolume(hsv[1], hsv[1]);

        switch(action) {
            //ACTION_DOWN: Event when finger presses DOWN on screen
            case MotionEvent.ACTION_DOWN:
                lastTime = System.currentTimeMillis();
                lastPos = new Point((int)event.getX(), (int)event.getY());
                rippleEffect((int)event.getX(), (int)event.getY());
                break;
            case MotionEvent.ACTION_MOVE:
                if (currentTime > lastTime+100) {
                    // check angle
                    Point currentPos = new Point((int)event.getX(), (int)event.getY());
                    double angleDif = Math.abs(getAngle(lastPos, currentPos));
                    // if angle is within 0.6 and 1.2 degrees, then increase saturation (hsv[1])
                        if (((angleDif > 6.0) && (angleDif < 20.0)) && hsv[1] <= 1.0f) {
                            // saturation and volume reaches 1 after 3s (calculate saturation rate - get saturation increment)
                            hsv[1] += 0.0333f;
                            changeTextColor(hsv[1]);
                            backAudio.setVolume(hsv[1], hsv[1]);
                        }
                        // else decrease saturation
                        else if (hsv[1] > 0f){
                            // saturation and volume reaches 0 after 3s (calculate saturation rate - get saturation decrement)
                            hsv[1] -= 0.0333f;
                            changeTextColor(hsv[1]);
                            backAudio.setVolume(hsv[1], hsv[1]);
                        }
                    lastPos = currentPos;
                    lastTime = currentTime;
                    Log.d("","Angle Difference: " + angleDif);
                }
                rippleEffect((int)event.getX(), (int)event.getY());
                break;
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_CANCEL:
                break;
        }
        return true;
    }

    // position the center of the ripple to the point of contact with screen
    private void rippleEffect(int x, int y) {
        rippleBackground.setX((float)x - centerX);
        rippleBackground.setY((float)y - centerY - naviHeight/2);
    }

    // make the text and button disappear with interaction
    private void changeTextColor(float v) {
        // set bounds
        if (v > 1f) {
            v = 1f;
        }
        else if (v < 0f) {
            v = 0f;
        }

        // calculate the reverse of the opacity/alpha value of the background
        int rev = (int)(255f - v * 255);

        // reduce the opacity/alpha value to the reverse of the background (255 - rev)
        exitButton.setTextColor(Color.argb(rev, 255, 255, 255));
        drawCircleText.setTextColor(Color.argb(rev, 108, 118, 131));
        exitButton.setBackgroundColor(Color.argb(rev, 51, 153,255));
    }

    // calculates the angle between two points relative to the center of the screen
    private double getAngle(Point lastPos, Point currentPos) {
        // calculate the angle between 3 points using the arccos rule
        double p12 = Math.pow(centerX - lastPos.x, 2) + Math.pow(centerY - lastPos.y, 2);
        double p13 = Math.pow(centerX - currentPos.x, 2) + Math.pow(centerY - currentPos.y, 2);
        double p23 = Math.pow(lastPos.x - currentPos.x, 2) + Math.pow(lastPos.y - currentPos.y, 2);
        double result = Math.toDegrees(Math.acos((p12 + p13 - p23) / (2 * Math.sqrt(p12) * Math.sqrt(p13))));
        return result;
    }

}
