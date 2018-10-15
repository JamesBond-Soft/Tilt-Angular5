import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { detect } from 'detect-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ManageWebinarService } from '../webinar.service';
import { AntMediaService } from '../antMedia.service';
import { LiveBroadcast, EndPoint, BroadcastingStatus, DeviceType } from '../LiveBroadcast';
import { IWebinarStatus, IWebinar, IWebinarGroupAssignment } from '../webinar';
import { IUpdateStatusRestModel, IUpdateHLSUrlRestModel, IUpdateResourceIdRestModel } from '../rest-model';
import { Observable, Subscription } from 'rxjs/Rx';
/// import for ResourceLibraryAsset
// tslint:disable-next-line:max-line-length
import { ResourceLibraryAssetService } from '../../resource-library/manage-resource-library/resource-library-assets/resource-library-asset.service';
// tslint:disable-next-line:max-line-length
import { IResourceLibraryAsset, IResourceLibraryAssetType, IResourceLibraryAssetStatus, IResourceGroupAssignment, IResourceLibraryFileProperties } from '../../resource-library/manage-resource-library/resource-library-assets/resource-library-asset';
import { LoginService } from '../../login/login.service';
import { IUserProfile } from '../../users/user-profile';
declare var getChromeExtensionStatus, getScreenId: any;
declare var WebRTCAdaptor           : any;
@Component({
  selector   : 'app-webinar-broadcast',
  templateUrl: './webinar-broadcast.component.html',
  styleUrls  : ['./webinar-broadcast.component.scss']
})
export class WebinarBroadcastComponent implements OnInit, OnDestroy {

  @ViewChild('videoElement') videoElement: ElementRef;
             video                       : any;
  currentWebinarStatus = BroadcastingStatus.STARTING;  // current webinar status
  IsSocketConnected = false;
  deviceType: DeviceType;  // 0: Webcam, 1: ScreenShare
  attendUserList : IUserProfile[];
  APISubscription: Subscription;
  APIIntervalTime = 30 * 1000; // 30Second
  pc_config      = null;
  sdpConstraints = {
      OfferToReceiveAudio: false,
      OfferToReceiveVideo: false
  };
  mediaConstraints = {
      video: true,
      audio: true
  };

  // websocketURL = 'ws://antcommunity.760dev.com:5080/WebRTCApp/websocket'; // Local Mode
   websocketURL = 'wss://antcommunity.760dev.com:5443/WebRTCApp/websocket'; // Product mode
  appName      = 'WebRTCApp';
  webRTCAdaptor: any;
  streamId = null;
  newStream  : LiveBroadcast;
  newEndpoint: EndPoint;

  webinarTodo   : IWebinar;
  newStatusModel: IUpdateStatusRestModel;
  newHLSUrlModel: IUpdateHLSUrlRestModel;

  // Variables for ResourceLibraryAsset 
  resourceLibraryAsset: IResourceLibraryAsset;

  @HostListener('window:unload', [ '$event' ])
  unloadHandler(event) {
    this.UpdateStatus(IWebinarStatus.COMPLETED);
  }

   @HostListener('window:beforeunload', ['$event'])
  public beforeunloadHandler($event) {
    this.UpdateStatus(IWebinarStatus.COMPLETED);
  } 

  constructor(
    private WebinarService             : ManageWebinarService,
    private antMediaService            : AntMediaService,
    private route                      : ActivatedRoute,
    private router                     : Router,
    private resourceLibraryAssetService: ResourceLibraryAssetService,
    private loginService               : LoginService
  ) {
    // get webinar data
    this.route.paramMap.subscribe(params => {
      if (params.has('webinarId')) {
        this.WebinarService.getWebinarDeatil(+params.get('webinarId')).subscribe(webinarBatch => {
          this.webinarTodo = webinarBatch;
        });
      }
    });
  }

  ngOnInit() {
      const $this = this;
      this.video         = this.videoElement.nativeElement;
      this.deviceType    = DeviceType.WEBCAM;
      this.webRTCAdaptor = new WebRTCAdaptor({
      websocket_url        : this.websocketURL,
      mediaConstraints     : this.mediaConstraints,
      peerconnection_config: this.pc_config,
      sdp_constraints      : this.sdpConstraints,
      localVideoId         : 'localVideo',
      debug                : true,
      callback             : function(info, description) {
        if (info === 'initialized') {
          console.log('initialized');
          $this.IsSocketConnected = true;
          // start_publish_button.disabled = false;
          // stop_publish_button.disabled = true;
        } else if (info === 'publish_started') {
          // stream is being published
          console.log('publish started');
          // start_publish_button.disabled = true;
          // stop_publish_button.disabled = false;
          // startAnimation();
        } else if (info === 'publish_finished') {
          // stream is being finished
          console.log('publish finished');
          // start_publish_button.disabled = false;
          // stop_publish_button.disabled = true;
        } else if (info === 'closed') {
          // console.log("Connection closed");
          // finish webinar
          if(this.IsSocketConnected) {
             this.IsSocketConnected = false;
             $this.finishWebinar();
          }
          if (typeof description !== 'undefined') {

          // In case of connection problem
          console.log('Connecton closed: ' + JSON.stringify(description));
          console.log('webinar finished');
          }
        }
      },
      callbackError : function(error) {
        // some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
        console.log('error callback: ' +  JSON.stringify(error));
        let errorMessage = JSON.stringify(error);
        if (typeof errorMessage !== 'undefined') {
          errorMessage = 'undefined';
        }
        if (error.indexOf('NotFoundError') !== -1) {
          errorMessage = 'Camera or Mic are not found or not allowed in your device';
        } else if (error.indexOf('NotReadableError') !== -1 || error.indexOf('TrackStartError') !== -1) {
          errorMessage = 'Camera or Mic is being used by some other process that does not let read the devices';
        } else if (error.indexOf('OverconstrainedError') !== -1 || error.indexOf('ConstraintNotSatisfiedError') !== -1) {
          errorMessage = 'There is no device found that fits your video and audio constraints. You may change video and audio constraints';
        } else if (error.indexOf('NotAllowedError') !== -1 || error.indexOf('PermissionDeniedError') !== -1) {
          errorMessage = 'You are not allowed to access camera and mic.';
        } else if (error.indexOf('TypeError') !== -1) {
          errorMessage = 'Video/Audio is required';
        }
        alert(errorMessage);
      }
    });
  }

  ngOnDestroy() {
    // Finish webinar while broadcasting
    if (this.currentWebinarStatus === BroadcastingStatus.BROADCASTING || this.currentWebinarStatus === BroadcastingStatus.PAUSED) {
      this.finishWebinar();
    }
  }


  
  SelectDeviceType(type: DeviceType) {
    this.deviceType = type;
    const browserType  = detect();
    if (this.deviceType === DeviceType.WEBCAM )
    {
      this.mediaConstraints = {
        video: true,
        audio: true
      };
      this.webRTCAdaptor.screenVideo(this.streamId, this.mediaConstraints);
    } 
    else if (this.deviceType === DeviceType.SCREENSHARE) {
      getChromeExtensionStatus((status) => {
        /// Check if Screensharing is enalbed in this browser
        if (status === 'installed-enabled') {
              ////// Screensharing is enabled
              if (browserType.name === 'chrome') {
                /// Action for Chrome
                getScreenId((error, sourceId, screen_constraints) => {
                  this.webRTCAdaptor.screenVideo(this.streamId, screen_constraints);
                });
              } else {
                /// Action for Firefox
                const config = {
                    video: {
                      mediaSource: 'screen',
                      width: {max : '1920'},
                      height: {max : '1080'},
                      frameRate : {max : '10'}
                    },
                    audio: true
                };
                this.webRTCAdaptor.screenVideo(this.streamId, config);
              }
        } else {
          //// Screensharing is not enabled
          alert('You should install Screensharing Extension');
          window.open('https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk', '_blank');
        }
      });
    }
  }

  getAttendedUsers()
  {
      this.WebinarService.getCurrentAttendedUsers(this.webinarTodo.webinarId).subscribe(response => {
        this.attendUserList = response;
        console.log('attended user list: ',this.attendUserList);
      }, error => {
        console.log(`getting attendedUser list error`, error)
      });
  }

  start() {
    ///
    if(!this.IsSocketConnected)
    {
        console.log('Socket is not connected');
        return;
    }
     if (this.currentWebinarStatus === BroadcastingStatus.STARTING) {
        // Not started Webniar
        // Start webinar action
        // publish
     
        this.newStream = new LiveBroadcast;
        this.antMediaService.createLiveStream(this.appName, this.newStream).subscribe((response) => {
            this.streamId = response.streamId;
            this.webRTCAdaptor.publish(this.streamId);
            // Webinar is started, Update Status of Webinar to Live
            this.UpdateStatus(IWebinarStatus.LIVE);
            // set Current webinar status to live
            this.currentWebinarStatus = BroadcastingStatus.BROADCASTING;
            // Start subscription to get webinar online users every 30 seconds
            this.APISubscription = Observable.interval(this.APIIntervalTime).subscribe(x => {
              this.getAttendedUsers();
            });
          }, (error) => {
            console.log('unexpected error', error);
      });
     } else if (this.currentWebinarStatus === BroadcastingStatus.PAUSED) {
       // Resume screencapturing/Webcam
       this.webRTCAdaptor.localStream.getAudioTracks()[0].enabled = true;
       this.webRTCAdaptor.localVideo.srcObject.getVideoTracks()[0].enabled = true;
       this.currentWebinarStatus = BroadcastingStatus.BROADCASTING;
     }
  }

  UpdateStatus(status: IWebinarStatus) {
    this.newStatusModel           = new IUpdateStatusRestModel;
    this.newStatusModel.newStatus = status;
    this.newStatusModel.webinarId = this.webinarTodo.webinarId;
    this.WebinarService.updateStatus(this.newStatusModel).subscribe(response => {
      if ( status === IWebinarStatus.LIVE) {
          // Update HLSOutput Url to Join Webinar  into database
          this.setHLSUrl();
      }
      /* else if ( status === IWebinarStatus.COMPLETED) {
        this.router.navigate(['/webinar/list']);
      } */
      console.log('Status Update Success');
    }, error => {
      console.log('unexpected error while updating webinar status', error);
    });
  }

  setHLSUrl() {
    // When broadcasting is started, Update HLS URL for viewers
    // HLS URL = http://antcommunity.760dev.com:5080/WebRTCApp/streams/<this.streamId>.m3u8
    this.newHLSUrlModel           = new IUpdateHLSUrlRestModel;
    this.newHLSUrlModel.webinarId = this.webinarTodo.webinarId;
    this.newHLSUrlModel.HLSUrl    = `https://antcommunity.760dev.com:5443/WebRTCApp/streams/${this.streamId}.m3u8`;
    this.WebinarService.setHLSUrl(this.newHLSUrlModel).subscribe(response => {
      console.log('New HLS URL updated');
      console.log(response);
    }, error => {
      console.log('unexpected error while setting HLS OutPut Url', error);
    });
  }

  pause() {
    // this.video.pause();
    // Stop screen capturing and video/mic
    this.currentWebinarStatus = BroadcastingStatus.PAUSED;
    this.stopStreamedVideo();
  }
 
  stopStreamedVideo() {
    // Mute Audio && Camera Off && Stop screensharing
    this.webRTCAdaptor.localStream.getAudioTracks()[0].enabled = false;
    this.webRTCAdaptor.localVideo.srcObject.getVideoTracks()[0].enabled = false;
  }

  confirmFinish() {
    // tslint:disable-next-line:max-line-length

    if (confirm(`Are you sure you want to finish the Webinar?`)) {
      this.finishWebinar();
    }
  }

  finishWebinar() {
      if(this.currentWebinarStatus === BroadcastingStatus.BROADCASTING || this.currentWebinarStatus === BroadcastingStatus.PAUSED)
      {
            // Stop streaming
            this.webRTCAdaptor.stop(this.streamId);
            this.currentWebinarStatus = BroadcastingStatus.COMPLETED;

            //  Set Status to Completed of Webinar
            this.UpdateStatus(IWebinarStatus.COMPLETED);
            // If record as resource is set as true, Update recoredResoruceURL of AWS S3,  set recorded file to ResourceLibraryAsset with assigned group members.
            // Save recorded file to ResourceLibraryAsset if record as resource is set
            if (this.webinarTodo.recordAsResource) {
              this.SaveResourceLibraryAsset();
            }
            //  **** delete live stream on ant media server issue now
          /*   this.antMediaService.deleteStream(this.appName, this.streamId).subscribe(
            response => {
              if (response) { console.log(response); }
            },
            error => {
              console.log('unexpected error while deleting stream', error);
            });
          */
            // stop getting current user list
            this.APISubscription.unsubscribe();
      } else if ( this.currentWebinarStatus === BroadcastingStatus.COMPLETED) {
          alert('Webinar has been already completed!');
      }
  }
  // Add Recorded Webinar file to ResourceLibraryAsset with assigned groups.
  SaveResourceLibraryAsset() {
    this.resourceLibraryAsset = this.resourceLibraryAssetService.initResourceLibraryAsset();

    // set the org id to the current user's organisation id if it's present
    if ( this.loginService.currentUser.organisationId) {
      this.resourceLibraryAsset.organisationId = this.loginService.currentUser.organisationId;
    } else {
      this.resourceLibraryAsset.organisationId = 0;
    }

    // Save webinar info for saving Recored file to ResourceLibraryAsset
    this.resourceLibraryAsset.name        = this.webinarTodo.name;
    this.resourceLibraryAsset.description = this.webinarTodo.description;
    this.resourceLibraryAsset.assetType   = IResourceLibraryAssetType.Video;

    //  **** Have to check whether UPloading to S3 is success in Ant Media Server
    this.resourceLibraryAsset.assetStatus = IResourceLibraryAssetStatus.Available;
    //  **** Set Resource category
    const fileProperties: IResourceLibraryFileProperties = {} as any;
          fileProperties.contentType                     = 'video/mp4';
          fileProperties.fileName                        = `${this.streamId}.mp4`;
          fileProperties.fileExtension                   = 'mp4';
    // recordResourceURL = https://s3-ap-southeast-2.amazonaws.com/tiltsuite-streaming/streams/<streamID>.mp4
    fileProperties.url                       = `https://s3-ap-southeast-2.amazonaws.com/tiltsuite-streaming/streams/${this.streamId}.mp4`;
    this.resourceLibraryAsset.fileProperties = fileProperties;

    // PreProcessedFileProperties Saving
    const preProcessedFileProperties: IResourceLibraryFileProperties = {} as any;
          preProcessedFileProperties.contentType                     = 'video/mp4';
          preProcessedFileProperties.fileName                        = `${this.streamId}.mp4`;
          preProcessedFileProperties.fileExtension                   = 'mp4';
          preProcessedFileProperties.url                             = `https://s3-ap-southeast-2.amazonaws.com/tiltsuite-streaming/streams/${this.streamId}.mp4`;
          this.resourceLibraryAsset.preProcessedFileProperties       = preProcessedFileProperties;

    // Set web.inar assigned groups to ResourceLibrary assignedGroups
    this.webinarTodo.webinarGroupAssignments.forEach((item: IWebinarGroupAssignment) => {
      const newResourceGroupAssignment: IResourceGroupAssignment = this.resourceLibraryAssetService.initResourceGroupAssignment();
            newResourceGroupAssignment.resourceLibraryAssetId    = 0;
            newResourceGroupAssignment.groupId                   = item.groupId;
      this.resourceLibraryAsset.resourceGroupAssignments.push(newResourceGroupAssignment);
    });

    this.resourceLibraryAssetService.saveResourceLibraryAsset(this.resourceLibraryAsset).subscribe((response) => {
        // Update ResourceLibraryAssetId of RecordedFile
        const model                        = new  IUpdateResourceIdRestModel;
              model.ResourceLibraryAssetId = response.resourceLibraryAssetId;
              model.webinarId              = this.webinarTodo.webinarId;
        this.WebinarService.updateRecordedFileAssetId(model).subscribe( (response) => {
        }, error => {
          console.log('unexpected error', error)
        });
       }, error => console.log(`Unexpected error: ${error} (ref cmdSave)`)
    );

  }
}
