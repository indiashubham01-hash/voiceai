import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  BookOpen,
  Maximize2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { DocumentSource } from '../types';
import { voiceService } from '../services/voiceService';

interface DocumentReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentSource | null;
}

export const DocumentReaderModal: React.FC<DocumentReaderModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSpeakingPage, setIsSpeakingPage] = useState<boolean>(false);

  if (!isOpen || !document) return null;

  // Generate realistic pages if not already provided
  const pages = document.pdfPages || [
    {
      pageNumber: 1,
      title: `${document.title} - Overview & Scope`,
      content: document.summary,
      keyPoints: [
        'Curriculum standard: CBSE / NCERT Grade 7 Science',
        'Authority rating: ' + document.trustScore + '% verified',
        'Status: ' + (document.status === 'active' ? 'Grounded in active lesson plan' : 'Excluded due to syllabus conflict')
      ]
    },
    {
      pageNumber: 2,
      title: 'Section 1.2: Food Making Process in Plants (Photosynthesis)',
      content: document.extractedSnippet,
      keyPoints: [
        'Raw Materials: Carbon dioxide (CO2) from air through stomata',
        'Water and minerals transported through xylem vessels',
        'Sunlight absorbed by chlorophyll in chloroplasts',
        'Balanced Chemical Stoichiometry: 6CO2 + 6H2O + Light -> C6H12O6 + 6O2'
      ],
      diagramDescription: 'Figure 1.2: Schematic diagram showing Photosynthesis in green leaf with sunlight, carbon dioxide entry through stomata, and oxygen release.'
    },
    {
      pageNumber: 3,
      title: 'Section 1.3: Experiments & Iodine Starch Test',
      content: 'Activity 1.1: Take two potted plants of the same kind. Keep one in the dark for 72 hours and the other in sunlight. Perform iodine test with leaves of both plants to test presence of starch (carbohydrates). Starch turns deep blue-black with iodine.',
      keyPoints: [
        'Iodine reagent turns blue-black in presence of starch',
        'Destarched control leaf shows no color change in dark condition',
        'Confirms sunlight is mandatory for glucose and starch formation'
      ]
    }
  ];

  const totalPages = pages.length;
  const currentDocPage = pages.find(p => p.pageNumber === currentPage) || pages[0];

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleToggleReadPage = () => {
    if (isSpeakingPage) {
      voiceService.stopSpeaking();
      setIsSpeakingPage(false);
    } else {
      const textToRead = `${currentDocPage.title}. ${currentDocPage.content}. Key points: ${(currentDocPage.keyPoints || []).join('. ')}`;
      setIsSpeakingPage(true);
      voiceService.speak(textToRead, () => {
        setIsSpeakingPage(false);
      }, 'en-IN');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* PDF Reader Toolbar Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          
          {/* Document Title & Badge */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${
              document.status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900 truncate max-w-md">
                  {document.filename}
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  document.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border-rose-200'
                }`}>
                  {document.trustScore}% Trust
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-sm">
                {document.title} • v{document.versionYear}
              </p>
            </div>
          </div>

          {/* Action & Reader Controls */}
          <div className="flex items-center space-x-2">
            
            {/* Read Page Aloud Voice Button */}
            <button
              onClick={handleToggleReadPage}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border ${
                isSpeakingPage
                  ? 'bg-blue-600 text-white border-blue-700 animate-pulse'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title="Read this document page aloud with Bhashini Indic Voice"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isSpeakingPage ? 'Mute' : 'Read Aloud'}</span>
            </button>

            {/* Page Navigation */}
            <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-slate-800 px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
              <button
                onClick={() => setZoomLevel(prev => Math.max(75, prev - 15))}
                className="p-1 rounded text-slate-600 hover:text-slate-900 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-semibold text-slate-700 px-1">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(150, prev + 15))}
                className="p-1 rounded text-slate-600 hover:text-slate-900 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Download Button */}
            {document.fileBlobUrl && (
              <a
                href={document.fileBlobUrl}
                download={document.filename}
                className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs flex items-center"
                title="Download Original File"
              >
                <Download className="w-4 h-4" />
              </a>
            )}

            {/* Print & Close */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
              title="Print / Save as PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (isSpeakingPage) {
                  voiceService.stopSpeaking();
                  setIsSpeakingPage(false);
                }
                onClose();
              }}
              className="p-2 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 text-slate-500 hover:text-rose-700 transition-colors shadow-xs cursor-pointer"
              title="Close Viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* PDF Reader Canvas Body */}
        <div className="flex-1 bg-slate-100/90 overflow-y-auto p-4 sm:p-8 flex justify-center">
          
          {/* Simulated High-Fidelity Printable PDF Sheet */}
          <div 
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 space-y-6 transition-transform duration-150 min-h-[750px] flex flex-col justify-between"
          >
            
            {/* Header Sheet Banner */}
            <div className="border-b-2 border-sky-600 pb-4 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="font-bold text-sky-700 uppercase">NATIONAL COUNCIL OF EDUCATIONAL RESEARCH & TRAINING</span>
                <span>Page {currentDocPage.pageNumber} of {totalPages}</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {currentDocPage.title}
              </h2>
              <div className="text-xs text-slate-500 font-medium flex items-center space-x-2">
                <span>Citation Key: <strong className="text-slate-800 font-mono">{document.citationKey}</strong></span>
                <span>•</span>
                <span>Verified Curriculum Source</span>
              </div>
            </div>

            {/* Page Content Body */}
            <div className="space-y-4 text-sm text-slate-800 leading-relaxed font-serif flex-1">
              <p className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-normal leading-relaxed">
                {currentDocPage.content}
              </p>

              {/* Highlight Box if this page contains the cited passage */}
              {currentDocPage.pageNumber === 2 && (
                <div className="p-4 rounded-xl bg-sky-50/80 border border-sky-200 text-xs font-sans space-y-2">
                  <div className="flex items-center space-x-1.5 text-sky-900 font-bold">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>Active Vector Chunk Cited by MINDMESH-NEXUS Co-Pilot</span>
                  </div>
                  <p className="text-sky-950 italic font-mono text-[11px]">
                    "{document.extractedSnippet}"
                  </p>
                </div>
              )}

              {/* Key Concept Points */}
              {currentDocPage.keyPoints && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-sans tracking-wider">
                    Core Concepts & Curriculum Checkpoints:
                  </h4>
                  <ul className="space-y-1.5 text-xs font-sans text-slate-700">
                    {currentDocPage.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-1.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Diagram Box */}
              {currentDocPage.diagramDescription && (
                <div className="p-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 font-sans space-y-2 text-xs">
                  <div className="flex items-center space-x-1.5 font-bold text-emerald-900">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>Curriculum Illustration Reference</span>
                  </div>
                  <p className="text-emerald-950 font-medium">
                    {currentDocPage.diagramDescription}
                  </p>
                </div>
              )}
            </div>

            {/* Sheet Footer */}
            <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-[11px] text-slate-500 font-sans">
              <span>MINDMESH-NEXUS Epistemic Grounding Engine</span>
              <span className="font-mono font-bold">Trust Rating: {document.trustScore}%</span>
            </div>

          </div>

        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs flex-shrink-0">
          <div className="flex items-center space-x-2 text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Document verified and indexed into vector memory (1536-dim embeddings)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Close Reader
          </button>
        </div>

      </div>
    </div>
  );
};
