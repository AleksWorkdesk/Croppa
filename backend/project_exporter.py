import os

class ProjectExporter:
    def __init__(self):
        pass

    def seconds_to_timecode(self, seconds, fps=30):
        """Convert seconds to SMPTE timecode HH:MM:SS:FF"""
        total_frames = int(seconds * fps)
        
        ff = total_frames % fps
        total_seconds = total_frames // fps
        ss = total_seconds % 60
        total_minutes = total_seconds // 60
        mm = total_minutes % 60
        hh = total_minutes // 60
        
        return f"{hh:02d}:{mm:02d}:{ss:02d}:{ff:02d}"

    def generate_edl(self, filename, segments, fps=30):
        """Generate an EDL (Edit Decision List) string"""
        title = os.path.splitext(filename)[0].upper()
        edl = []
        edl.append(f"TITLE: {title}")
        edl.append("FCM: NON-DROP FRAME")
        edl.append("")

        timeline_seconds = 0.0
        
        for i, seg in enumerate(segments):
            index = f"{i+1:03d}"
            
            # Source In/Out
            src_in = self.seconds_to_timecode(seg['start'], fps)
            src_out = self.seconds_to_timecode(seg['end'], fps)
            
            # Timeline In/Out
            duration = seg['end'] - seg['start']
            rec_in = self.seconds_to_timecode(timeline_seconds, fps)
            rec_out = self.seconds_to_timecode(timeline_seconds + duration, fps)
            
            # EDL Line: 001  AX  V  C  [SrcIn] [SrcOut] [RecIn] [RecOut]
            # AX = Auxiliary/Unknown Tape Name
            # V = Video
            # C = Cut
            line = f"{index}  AX       V     C        {src_in} {src_out} {rec_in} {rec_out}"
            edl.append(line)
            
            # Update timeline position
            timeline_seconds += duration

        return "\n".join(edl)

    def generate_shotcut_xml(self, filename, filepath, segments, fps=30):
        """Generate a minimal Shotcut MLT XML (Simplified)"""
        # Note: Generating a full MLT XML is complex. 
        # For now, EDL is the safest cross-platform bet, but we can add XML later.
        pass
