package com.tzt_entry;
import android.annotation.SuppressLint;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.widget.Toast;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;
import android.content.Intent; 
import android.content.res.Configuration;
public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "TZT_Entry";
  }
    @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegate(this, getMainComponentName()) {
      @Override
      protected ReactRootView createRootView() {
       return new RNGestureHandlerEnabledRootView(MainActivity.this);
      }
    };
  }
  @Override
  public void onConfigurationChanged(Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    Intent intent = new Intent("onConfigurationChanged");
    intent.putExtra("newConfig", newConfig);
    this.sendBroadcast(intent);
  }

  /*bluetooth adapter availability*/
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
  /*INIT BLUETOOTH SERVICE*/
    PrinterManager.mService = new BluetoothService(getApplicationContext(), mHandler);
  }

  /*MESSAGE HANDLER BLUETOOTH STATE*/
  @SuppressLint("HandlerLeak")
  private final Handler mHandler = new Handler() {
    @Override
    public void handleMessage(Message msg) {
      switch (msg.what) {
        case BluetoothService.MESSAGE_STATE_CHANGE:
          switch (msg.arg1) {
            case BluetoothService.STATE_CONNECTED:
              Toast.makeText(getApplicationContext(), Constants.connected, Toast.LENGTH_SHORT).show();
              break;
            case BluetoothService.STATE_CONNECTING:
              Toast.makeText(getApplicationContext(), Constants.connecting, Toast.LENGTH_SHORT).show();
              break;
            case BluetoothService.STATE_LISTEN:
            case BluetoothService.STATE_NONE:
              break;
          }
          break;
        case BluetoothService.MESSAGE_CONNECTION_LOST:
          Toast.makeText(getApplicationContext(), Constants.disconnected, Toast.LENGTH_SHORT).show();
          break;
        case BluetoothService.MESSAGE_UNABLE_CONNECT:
          Toast.makeText(getApplicationContext(), Constants.unable_to_connect, Toast.LENGTH_SHORT).show();
          break;
      }
    }
  };

  @Override
  public void onStart() {
    super.onStart();
  }

  /*Destroy*/
  @Override
  protected void onDestroy() {
    super.onDestroy();
    if (PrinterManager.mService != null)
      PrinterManager.mService.stop();
    PrinterManager.mService = null;
  }
}
