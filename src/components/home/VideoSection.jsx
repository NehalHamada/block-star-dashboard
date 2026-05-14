import { Video } from "lucide-react";
import { SectionCard, VideoField } from "./HomeUI";

/**
 * VideoSection
 * Displays the main intro video in view mode;
 * shows a file picker in edit mode.
 */
const VideoSection = ({ editing, data, form, onFileChange }) => (
  <SectionCard icon={Video} title="الفيديو">
    {editing ? (
      <VideoField
        videoUrl={form?.video_url}
        videoFile={form?.video_file}
        videoPreview={form?.video_preview}
        onFileChange={onFileChange}
      />
    ) : (
      <div>
        {data?.video_url ? (
          <div className="space-y-3">
            <video
              src={data.video_url}
              controls
              className="w-full max-w-lg rounded-xl border border-gray-200 shadow-sm"
              style={{ maxHeight: 240 }}
            />
            <p className="text-[11px] text-gray-400 break-all">{data.video_url}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-300">
            <Video size={40} strokeWidth={1} />
            <p className="text-sm mt-2">لا يوجد فيديو محدد</p>
          </div>
        )}
      </div>
    )}
  </SectionCard>
);

export default VideoSection;
