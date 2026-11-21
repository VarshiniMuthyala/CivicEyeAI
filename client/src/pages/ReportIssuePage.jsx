import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Upload,
  Cpu,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Info,
  Copy,
  ExternalLink,
  Video,
  SwitchCamera,
  CircleDot,
  X
} from 'lucide-react';
import { aiService, complaintService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LocationPickerMap from '../components/LocationPickerMap';
import SeverityBadge from '../components/SeverityBadge';
import { CIVIC_CATEGORIES, DEPARTMENTS } from '../utils/constants';

export const ReportIssuePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  // Mode: 'upload' or 'camera'
  const [captureMode, setCaptureMode] = useState('upload');

  // Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [stagedImageUrl, setStagedImageUrl] = useState('');
  const [issueType, setIssueType] = useState('Potholes and damaged roads');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [department, setDepartment] = useState('Roads and Infrastructure Department');
  const [latitude, setLatitude] = useState(17.385044);
  const [longitude, setLongitude] = useState(78.486671);
  const [address, setAddress] = useState('');
  const [citizenName, setCitizenName] = useState(user?.name || '');
  const [citizenEmail, setCitizenEmail] = useState(user?.email || '');

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);

  // Duplicate Detection State
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Live Camera State & Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (rear) or 'user' (front)

  // Sync user info if changed
  useEffect(() => {
    if (user) {
      if (!citizenName) setCitizenName(user.name);
      if (!citizenEmail) setCitizenEmail(user.email);
    }
  }, [user]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start live webcam / phone camera
  const startCamera = async (mode = facingMode) => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera initialization failed:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser settings.'
          : err.message || 'Unable to access live camera feed.'
      );
      setCameraActive(false);
    }
  };

  // Stop camera tracks
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Toggle front/rear camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (cameraActive) {
      startCamera(nextMode);
    }
  };

  // Switch tabs between Upload and Live Camera
  const handleTabSwitch = (mode) => {
    setCaptureMode(mode);
    if (mode === 'camera') {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
  };

  // Capture current frame from live camera feed
  const captureFrameFromCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas image to JPEG file
    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const capturedFile = new File([blob], `live-capture-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });

        const objectUrl = URL.createObjectURL(blob);
        setSelectedFile(capturedFile);
        setPreviewUrl(objectUrl);
        setAiResult(null);
        setAiError(null);

        // Turn off camera after capture
        stopCamera();
        setCaptureMode('upload');

        // Automatically trigger Gemini AI analysis on the captured photo!
        analyzeImagePayload(capturedFile);
      },
      'image/jpeg',
      0.92
    );
  };

  // Handle File Selection (Upload Mode)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file format. Please upload JPG, JPEG, PNG, or WEBP.');
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please upload a smaller image.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setAiResult(null);
    setAiError(null);
  };

  // Core Gemini AI Image Analysis
  const analyzeImagePayload = async (fileToAnalyze) => {
    const file = fileToAnalyze || selectedFile;
    if (!file) {
      alert('Please select or capture a photograph first.');
      return;
    }

    setIsAnalyzing(true);
    setAiError(null);

    try {
      const data = await aiService.analyzeImage(file, language);

      if (data?.analysis) {
        setAiResult(data.analysis);
        if (data.tempImageUrl) {
          setStagedImageUrl(data.tempImageUrl);
        }

        // Auto-fill form fields with AI recommendations
        if (data.analysis.issueType) setIssueType(data.analysis.issueType);
        if (data.analysis.description) setDescription(data.analysis.description);
        if (data.analysis.severity) setSeverity(data.analysis.severity);
        if (data.analysis.department) setDepartment(data.analysis.department);

        // Check for duplicates with new category
        checkNearbyDuplicates(latitude, longitude, data.analysis.issueType);
      }
    } catch (err) {
      console.error('AI Analysis failed:', err);
      const msg = err.response?.data?.error || err.message || 'AI Analysis failed. You may enter details manually.';
      setAiError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        checkNearbyDuplicates(lat, lng, issueType);
      },
      (err) => {
        alert('Could not retrieve GPS location: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLocationSelect = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
    checkNearbyDuplicates(lat, lng, issueType);
  };

  // Check Duplicate Complaints
  const checkNearbyDuplicates = async (lat, lng, currentType) => {
    try {
      const res = await complaintService.checkDuplicate({
        latitude: lat,
        longitude: lng,
        issueType: currentType
      });

      if (res?.hasDuplicates && res.duplicates.length > 0) {
        setDuplicateWarning(res.duplicates);
      } else {
        setDuplicateWarning(null);
      }
    } catch (e) {
      // Duplicate check is non-fatal
    }
  };

  // Submit Complaint
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();

    if (!selectedFile && !stagedImageUrl) {
      alert('Please upload or snap an incident photograph.');
      return;
    }

    if (!description.trim()) {
      alert('Please provide a short description of the problem.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('image', selectedFile);
      } else if (stagedImageUrl) {
        formData.append('image_url', stagedImageUrl);
      }

      formData.append('issue_type', issueType);
      formData.append('description', description);
      formData.append('severity', severity);
      formData.append('confidence', aiResult?.confidence || 'High');
      formData.append('department', department);
      formData.append('recommendation', aiResult?.recommendation || '');
      formData.append('reason', aiResult?.reason || '');
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('address', address);
      formData.append('citizen_name', citizenName || 'Anonymous Citizen');
      formData.append('citizen_email', citizenEmail || '');

      const response = await complaintService.createComplaint(formData);

      if (response?.complaint) {
        setSubmitSuccess(response.complaint);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit complaint: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyId = () => {
    if (submitSuccess?.id) {
      navigator.clipboard.writeText(submitSuccess.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      {/* Hidden Canvas for Live Video Snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Title */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-white font-['Outfit'] mb-2">
          {t('reportTitle')}
        </h1>
        <p className="text-sm text-slate-400">
          Capture with live camera or upload a photograph to analyze with Google Gemini AI.
        </p>
      </div>

      {/* Main Reporting Form */}
      <form onSubmit={handleSubmitComplaint} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Photograph & AI Triage */}
        <div className="lg:col-span-6 space-y-6">
          {/* Photograph & Live Camera Card */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Camera size={16} className="text-blue-400" />
                <span>1. Incident Photograph</span>
              </h2>

              {/* Mode Switcher: Upload File vs Live Camera */}
              <div className="flex p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => handleTabSwitch('upload')}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                    captureMode === 'upload' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload size={12} />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('camera')}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                    captureMode === 'camera' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Video size={12} className={captureMode === 'camera' ? 'animate-pulse' : ''} />
                  <span>Live Camera</span>
                </button>
              </div>
            </div>

            {/* LIVE CAMERA VIEWFINDER MODE */}
            {captureMode === 'camera' ? (
              <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/40 shadow-inner">
                {cameraError ? (
                  <div className="p-8 text-center space-y-3">
                    <AlertTriangle size={32} className="text-amber-400 mx-auto" />
                    <p className="text-xs text-amber-200">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => startCamera(facingMode)}
                      className="btn btn-secondary text-xs py-1.5 px-3 rounded-lg inline-flex items-center gap-1 text-cyan-300"
                    >
                      <RefreshCw size={13} />
                      <span>Retry Camera Access</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative w-full h-72 bg-black flex items-center justify-center">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className="w-full h-full object-cover"
                    />

                    {/* Reticle / Viewfinder Overlay */}
                    <div className="absolute inset-6 border border-cyan-400/40 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                      <div className="flex justify-between text-[10px] text-cyan-300 font-mono">
                        <span>● LIVE STREAM</span>
                        <span>TARGET RETICLE</span>
                      </div>
                      <div className="text-center text-[11px] text-slate-300 bg-black/60 backdrop-blur-sm py-1 px-3 rounded-full mx-auto font-medium">
                        Align street defect in center & tap capture
                      </div>
                      <div className="text-right text-[10px] text-cyan-300 font-mono">
                        CIVICEYE VISION
                      </div>
                    </div>

                    {/* Camera Control Bar */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
                      <button
                        type="button"
                        onClick={toggleFacingMode}
                        title="Flip Camera (Front/Rear)"
                        className="p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-200 hover:text-cyan-400"
                      >
                        <SwitchCamera size={16} />
                      </button>

                      {/* Snap & Analyze Button */}
                      <button
                        type="button"
                        onClick={captureFrameFromCamera}
                        disabled={!cameraActive}
                        className="btn btn-primary py-2.5 px-6 rounded-full font-bold text-xs shadow-xl shadow-cyan-500/30 flex items-center gap-2 border border-cyan-300"
                      >
                        <CircleDot size={16} className="text-white animate-pulse" />
                        <span>Snap & Analyze with AI</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTabSwitch('upload')}
                        title="Close Camera"
                        className="p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-200 hover:text-red-400"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* UPLOAD FILE MODE */
              <div className="relative border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-4 text-center transition-colors bg-slate-900/60">
                {previewUrl ? (
                  <div className="space-y-3">
                    <div className="w-full h-64 rounded-lg overflow-hidden bg-slate-950 relative border border-slate-800">
                      <img src={previewUrl} alt="Incident preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <label className="btn btn-secondary text-xs py-1.5 px-3 cursor-pointer inline-flex items-center gap-1.5">
                        <RefreshCw size={13} />
                        <span>Upload Different File</span>
                        <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleTabSwitch('camera')}
                        className="btn btn-secondary text-xs py-1.5 px-3 rounded-lg inline-flex items-center gap-1.5 text-cyan-300"
                      >
                        <Video size={13} />
                        <span>Open Live Camera</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 py-6">
                    <label className="cursor-pointer block">
                      <div className="w-14 h-14 rounded-full bg-blue-600/15 border border-blue-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3">
                        <Upload size={24} />
                      </div>
                      <div className="text-sm font-semibold text-slate-200 mb-1">
                        {t('uploadPrompt')}
                      </div>
                      <div className="text-xs text-slate-400">
                        {t('uploadFormats')}
                      </div>
                      <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
                    </label>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <span className="text-xs text-slate-500 uppercase font-semibold">Or</span>
                      <button
                        type="button"
                        onClick={() => handleTabSwitch('camera')}
                        className="btn btn-secondary text-xs py-2 px-4 rounded-xl flex items-center gap-2 text-cyan-300 border-cyan-800/40 hover:bg-cyan-950/30 font-semibold"
                      >
                        <Video size={15} className="text-cyan-400" />
                        <span>Open Live Camera Viewfinder</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Analyze Action (if photo selected) */}
            {selectedFile && captureMode === 'upload' && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => analyzeImagePayload()}
                  disabled={isAnalyzing}
                  className="btn btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-600/30"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin text-cyan-300" />
                      <span>{t('analyzing')}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="text-cyan-300" />
                      <span>{t('btnAnalyze')}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* AI Notice */}
            {aiError && (
              <div className="mt-3 p-3 rounded-lg bg-amber-950/40 border border-amber-800 text-xs text-amber-200 flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">AI Notice: </span>
                  <span>{aiError}</span>
                  <div className="text-slate-400 mt-1">
                    You can still fill out and submit the complaint manually below.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Gemini AI Analysis Card (When Available) */}
          {aiResult && (
            <div className="card p-5 border-cyan-500/50 bg-slate-900/90 shadow-xl relative animate-in fade-in">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu size={16} className="text-cyan-400" />
                  <h3 className="font-bold text-sm text-white">{t('aiCardTitle')}</h3>
                </div>
                <SeverityBadge severity={aiResult.severity} />
              </div>

              {!aiResult.isCivicIssue && (
                <div className="mb-3 p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-xs text-red-200 flex items-start gap-2">
                  <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">No Recognized Civic Grievance: </span>
                    <span>Gemini indicates this photo may not show a public infrastructure problem. Please ensure the image clearly shows the municipal defect.</span>
                  </div>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">{t('detectedCategory')}</span>
                  <span className="font-bold text-white text-sm">{aiResult.issueType}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">{t('recDepartment')}</span>
                  <span className="font-semibold text-blue-400">{aiResult.department}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">{t('aiReasoning')}</span>
                  <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    {aiResult.reason}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">{t('suggestedAction')}</span>
                  <p className="text-emerald-300 font-medium leading-relaxed bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-900/40">
                    {aiResult.recommendation}
                  </p>
                </div>

                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800 flex items-center gap-1">
                  <Info size={12} />
                  <span>{t('aiDisclaimer')} You may adjust any field below before submitting.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Location, Details & Submit */}
        <div className="lg:col-span-6 space-y-6">
          {/* Location Card */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin size={16} className="text-cyan-400" />
                <span>2. {t('locationTitle')}</span>
              </h2>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="btn btn-secondary text-xs py-1 px-2.5 rounded-lg text-cyan-400 border-cyan-800/50 hover:bg-cyan-950/30 font-semibold"
              >
                {t('useMyLocation')}
              </button>
            </div>

            {/* Interactive Leaflet Map Picker */}
            <LocationPickerMap
              latitude={latitude}
              longitude={longitude}
              onLocationSelect={handleLocationSelect}
            />

            {/* Address & Coords */}
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">{t('latitude')}</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="input-field text-xs py-2"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">{t('longitude')}</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="input-field text-xs py-2"
                />
              </div>
              <div className="col-span-2">
                <label className="text-slate-400 block mb-1">Landmark / Street Address</label>
                <input
                  type="text"
                  placeholder={t('addressPlaceholder')}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>
            </div>
          </div>

          {/* Potential Duplicate Alert Banner */}
          {duplicateWarning && duplicateWarning.length > 0 && (
            <div className="card p-4 border-amber-500/50 bg-amber-950/20 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-300">{t('dupAlertTitle')}</h4>
                  <p className="text-slate-300 leading-relaxed">{t('dupAlertDesc')}</p>
                  <div className="mt-2 space-y-1 bg-slate-950/60 p-2 rounded border border-slate-800">
                    {duplicateWarning.map((dup) => (
                      <div key={dup.id} className="flex justify-between items-center text-[11px]">
                        <span className="font-mono text-cyan-400 font-semibold">{dup.id} ({dup.distanceMeters}m away)</span>
                        <span className="text-slate-400">{dup.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Issue Details Card */}
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              3. Issue Details & Verification
            </h2>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1.5">Civic Category</label>
              <select
                value={issueType}
                onChange={(e) => {
                  setIssueType(e.target.value);
                  checkNearbyDuplicates(latitude, longitude, e.target.value);
                }}
                className="input-field text-sm"
              >
                <option value="Potholes and damaged roads">Potholes and damaged roads</option>
                <option value="Garbage accumulation">Garbage accumulation</option>
                <option value="Water leakage">Water leakage</option>
                <option value="Drainage overflow">Drainage overflow</option>
                <option value="Broken streetlights">Broken streetlights</option>
                <option value="Public infrastructure damage">Public infrastructure damage</option>
                <option value="Pollution">Pollution</option>
                <option value="Other civic issues">Other civic issues</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1.5">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="Critical">🔴 Critical</option>
                  <option value="High">🟠 High</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Low">🟢 Low</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1.5">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="Roads and Infrastructure Department">Roads and Infrastructure</option>
                  <option value="Sanitation Department">Sanitation Department</option>
                  <option value="Water Supply Department">Water Supply Department</option>
                  <option value="Drainage Department">Drainage Department</option>
                  <option value="Electrical Department">Electrical Department</option>
                  <option value="Environmental Department">Environmental Department</option>
                  <option value="Public Works Department">Public Works Department</option>
                  <option value="General Administration">General Administration</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1.5">Grievance Description</label>
              <textarea
                rows={3}
                placeholder={t('descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field text-sm resize-none"
                required
              />
            </div>

            {/* Citizen identification */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Citizen Name</label>
                <input
                  type="text"
                  placeholder="Anonymous"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Contact Email</label>
                <input
                  type="email"
                  placeholder="Optional for updates"
                  value={citizenEmail}
                  onChange={(e) => setCitizenEmail(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin text-cyan-300" />
                    <span>{t('submitting')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>{t('submitComplaint')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Success Modal */}
      {submitSuccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full border-emerald-500/50 shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle size={28} />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-extrabold text-white font-['Outfit']">
                Civic Grievance Submitted!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Your report has been logged and queued for municipal triage.
              </p>
            </div>

            {/* Generated Unique Complaint ID Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Official Complaint Tracking ID
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-2xl font-extrabold text-cyan-400 tracking-wider">
                  {submitSuccess.id}
                </span>
                <button
                  type="button"
                  onClick={copyId}
                  title="Copy Tracking ID"
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  <Copy size={16} />
                </button>
              </div>
              {copiedId && (
                <span className="text-[11px] text-emerald-400 font-semibold block">
                  ✓ Copied to clipboard!
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold text-white">{submitSuccess.issue_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-blue-400">{submitSuccess.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Severity:</span>
                <SeverityBadge severity={submitSuccess.severity} size="small" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/track?id=${submitSuccess.id}`)}
                className="btn btn-primary flex-1 text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 font-bold"
              >
                <span>Track Live Progress</span>
                <ExternalLink size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmitSuccess(null);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setAiResult(null);
                  setDescription('');
                }}
                className="btn btn-secondary text-xs py-2.5 px-4 rounded-lg"
              >
                Submit Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportIssuePage;
