"""
Shotcut MLT XML Project Exporter
Generates Shotcut-compatible MLT XML files from video segments.
"""
import os

class ShotcutExporter:
    def __init__(self):
        pass
    
    def generate_mlt(self, video_path: str, segments: list, fps: float = 30.0) -> str:
        """
        Generate Shotcut MLT XML project file.
        
        Args:
            video_path: Absolute path to the video file
            segments: List of dicts with 'start' and 'end' times in seconds
            fps: Frames per second (default 30.0)
        
        Returns:
            MLT XML content as string
        """
        
        # Ensure we have an absolute path with forward slashes
        abs_path = os.path.abspath(video_path).replace('\\', '/')
        
        # Calculate total duration from segments
        if segments:
            total_frames = int(segments[-1]['end'] * fps)
        else:
            total_frames = 1000
        
        # Build MLT XML with proper Shotcut structure
        mlt = f'''<?xml version="1.0" encoding="utf-8"?>
<mlt LC_NUMERIC="C" version="7.14.0" title="Croppa Project" producer="main_bin">
  <profile description="automatic" width="1920" height="1080" progressive="1" sample_aspect_num="1" sample_aspect_den="1" display_aspect_num="16" display_aspect_den="9" frame_rate_num="{int(fps)}" frame_rate_den="1" colorspace="709"/>
  
  <producer id="producer0" in="0" out="{total_frames}">
    <property name="length">{total_frames + 1}</property>
    <property name="eof">pause</property>
    <property name="resource">{abs_path}</property>
    <property name="mlt_service">avformat-novalidate</property>
    <property name="seekable">1</property>
    <property name="audio_index">1</property>
    <property name="video_index">0</property>
  </producer>
  
  <playlist id="main_bin">
    <property name="xml_retain">1</property>
    <entry producer="producer0" in="0" out="{total_frames}"/>
  </playlist>
  
  <producer id="black" in="0" out="500">
    <property name="length">15000</property>
    <property name="eof">pause</property>
    <property name="resource">0</property>
    <property name="aspect_ratio">1</property>
    <property name="mlt_service">color</property>
    <property name="set.test_audio">0</property>
  </producer>
  
  <playlist id="background">
    <entry producer="black" in="0" out="{total_frames}"/>
  </playlist>
  
  <playlist id="playlist0">
'''
        
        # Add each segment as an entry
        for seg in segments:
            in_frame = int(seg['start'] * fps)
            out_frame = int(seg['end'] * fps)
            mlt += f'    <entry producer="producer0" in="{in_frame}" out="{out_frame}"/>\n'
        
        mlt += f'''  </playlist>
  
  <playlist id="playlist1"/>
  
  <tractor id="tractor0" in="0" out="{total_frames}">
    <property name="shotcut">1</property>
    <property name="shotcut:projectAudioChannels">2</property>
    <property name="shotcut:projectFolder">0</property>
    <track producer="background"/>
    <track producer="playlist0"/>
    <track producer="playlist1" hide="video"/>
    <transition id="transition0">
      <property name="a_track">0</property>
      <property name="b_track">1</property>
      <property name="mlt_service">mix</property>
      <property name="always_active">1</property>
      <property name="sum">1</property>
    </transition>
    <transition id="transition1">
      <property name="a_track">0</property>
      <property name="b_track">1</property>
      <property name="version">0.9</property>
      <property name="mlt_service">frei0r.cairoblend</property>
      <property name="always_active">1</property>
      <property name="disable">1</property>
    </transition>
    <transition id="transition2">
      <property name="a_track">0</property>
      <property name="b_track">2</property>
      <property name="mlt_service">mix</property>
      <property name="always_active">1</property>
      <property name="sum">1</property>
    </transition>
  </tractor>
</mlt>
'''
        
        return mlt
