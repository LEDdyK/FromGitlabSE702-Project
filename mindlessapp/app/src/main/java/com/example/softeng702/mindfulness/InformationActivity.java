package com.example.softeng702.mindfulness;

import android.app.Activity;
import android.app.Fragment;
import android.app.FragmentManager;
import android.app.FragmentTransaction;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.FrameLayout;

/**
 *
 */

public class InformationActivity extends Activity {

    private static final int MaxFragments = 3;

    private Button btnNext;
    private Button btnBack;

    private int currentState;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Hide the title bar
        this.requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().getDecorView().setSystemUiVisibility( View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);

        setContentView(R.layout.activity_information);

        // Set the current fragment as 0
        this.currentState = 0;
        updateCurrentFragment();

        // Set up next button
        this.btnNext = findViewById(R.id.next);
        this.btnNext.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (currentState == 2) {
                    Intent intent = new Intent(InformationActivity.this, InteractiveActivity.class);
                    finish();
                    startActivity(intent);
                }
                else if (currentState == 1) {
                    btnNext.setText("start");
                }
                // Change to the next fragment
                changeState(1);
            }
        });

        // Set up back button
        this.btnBack = findViewById(R.id.back);
        this.btnBack.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (currentState == 2) {
                    btnNext.setText("next");
                }
                // Change back to previous fragment
                changeState(-1);
            }
        });

    }

    private void changeState(int increaseAmount)
    {
        // Dont change state when fragment index has reached bounds
        boolean isIncrease = increaseAmount > 0;

        if (this.currentState == 0 && !isIncrease
                || this.currentState == MaxFragments - 1 && isIncrease) {
            return;
        }

        this.currentState += increaseAmount;
        updateCurrentFragment();
    }

    private void updateCurrentFragment() {
        // Set the fragment at current index
        Fragment nextFragment = null;

        // TODO replace with a list of fragments, instead of creating new fragments each time
        switch (currentState) {
            case 0:
                // Fragment0
                nextFragment = new Fragment0();
                break;
            case 1:
                // Fragment1
                nextFragment = new Fragment1();
                break;
            case 2:
                // Fragment2
                nextFragment = new Fragment2();
                break;
            default:
                Log.w("InformationActivity", "Exceeded number of fragments to show");
                return;
        }

        FragmentManager fm = getFragmentManager();
        FragmentTransaction transaction = fm.beginTransaction();
        transaction.replace(R.id.frame_layout, nextFragment);
        transaction.commit();
    }
}
