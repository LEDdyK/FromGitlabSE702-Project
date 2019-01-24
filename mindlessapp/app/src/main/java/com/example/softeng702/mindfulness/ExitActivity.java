package com.example.softeng702.mindfulness;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.view.View;
import android.view.Window;
import android.widget.Button;

public class ExitActivity extends Activity {

    private Button exitButton;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState){
        super.onCreate(savedInstanceState);

        // Hide the title bar
        this.requestWindowFeature(Window.FEATURE_NO_TITLE);
        this.getWindow().getDecorView().setSystemUiVisibility( View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);

        setContentView(R.layout.activity_exit);

        this.exitButton = findViewById(R.id.exitButton);
        this.exitButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(ExitActivity.this, InformationActivity.class);
                finish();
                startActivity(intent);
            }
        });
    }
}
