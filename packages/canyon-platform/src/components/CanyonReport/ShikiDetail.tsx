import { mergeIntervals } from "./helper.tsx";
import { createHighlighterCoreInstance } from "@/components/CanyonReport/loadShiki.ts";

const ShikiDetail = ({ defaultValue, filecoverage, theme }) => {
  const [content, setContent] = useState("");

  const statementStats = filecoverage.s;
  const statementMeta = filecoverage.statementMap;
  const structuredText = defaultValue
    .split("\n")
    .reduce((previousValue, currentValue, currentIndex) => {
      return {
        ...previousValue,
        [currentIndex]: currentValue,
      };
    }, {});
  const statementDecorations = [];

  Object.entries(statementStats).forEach(([stName, count]) => {
    const meta = statementMeta[stName];
    if (meta) {
      const type = count > 0 ? "yes" : "no";
      const startCol = meta.start.column;
      const endCol = meta.end.column + 1;
      const startLine = meta.start.line;
      const endLine = meta.end.line;

      if (type === "no" && structuredText[startLine]) {
        if (endLine !== startLine) {
          // endCol = structuredText[startLine].length;
        }
        //     转化为字符的起始

        let start = 0;
        let end = 0;

        for (let i = 0; i < startLine - 1; i++) {
          start += structuredText[i].length + 1;
        }
        for (let i = 0; i < endLine - 1; i++) {
          // TODO: 这里有问题，可能是源码编译前有代码格式化
          end += (structuredText[i]?.length || 0) + 1;
        }

        start += startCol;
        end += endCol;
        statementDecorations.push([start, end]);
      }
    }
  });

  const fnDecorations = [];
  const fnStats = filecoverage.f;
  const fnMeta = filecoverage.fnMap;
  Object.entries(fnStats).forEach(([fName, count]) => {
    const meta = fnMeta[fName];
    if (meta) {
      const type = count > 0 ? "yes" : "no";
      // Some versions of the instrumenter in the wild populate 'func'
      // but not 'decl':
      const decl = meta.decl || meta.loc;
      const startCol = decl.start.column;
      const endCol = decl.end.column + 1;
      const startLine = decl.start.line;
      const endLine = decl.end.line;

      if (type === "no" && structuredText[startLine]) {
        if (endLine !== startLine) {
          // endCol = structuredText[startLine].length;
        }

        //     转化为字符的起始

        let start = 0;
        let end = 0;

        for (let i = 0; i < startLine - 1; i++) {
          start += structuredText[i].length + 1;
        }
        for (let i = 0; i < endLine - 1; i++) {
          end += structuredText[i].length + 1;
        }

        start += startCol;
        end += endCol;
        fnDecorations.push([start, end]);
      }
    }
  });

  const branchStats = filecoverage.b;
  const branchMeta = filecoverage.branchMap;

  const branchDecorations = [];

  function specialLogicByIf(branchRange, index) {
    if (
      branchRange.type === "if" &&
      branchRange.locations.length > 1 &&
      Number(index) === 0
    ) {
      return false;
    } else {
      return true;
    }
  }

  Object.entries(branchStats).forEach(([bName, counts]) => {
    const meta = branchMeta[bName];
    if (meta) {
      Object.entries(meta.locations).forEach(([index, location]) => {
        const count = counts[index];
        if (count === 0 && specialLogicByIf(meta)) {
          const startCol = location.start.column;
          const endCol = location.end.column + 1;
          const startLine = location.start.line;
          const endLine = location.end.line;

          //     转化为字符的起始

          let start = 0;
          let end = 0;

          for (let i = 0; i < startLine - 1; i++) {
            start += structuredText[i].length + 1;
          }
          for (let i = 0; i < endLine - 1; i++) {
            end += structuredText[i].length + 1;
          }

          start += startCol;
          end += endCol;
          branchDecorations.push([start, end]);
        }
      });
    }
  });

  useEffect(() => {
    createHighlighterCoreInstance().then(({ codeToHtml }) => {
      try {
        const res = codeToHtml(defaultValue, {
          lang: "javascript",
          theme: theme === "light" ? "light-plus" : "tokyo-night",
          decorations: mergeIntervals(
            [
              ...statementDecorations,
              ...fnDecorations,
              ...branchDecorations,
            ].filter((item) => {
              // defaultValue
              if (item[0] >= item[1]) {
                return false;
              } else if (item[1] > defaultValue.length) {
                return false;
              } else {
                return item[0] < item[1];
              }
            }),
          ).map(([start, end]) => {
            return {
              start,
              end,
              properties: { class: "content-class-no-found" },
            };
          }),
        });
        setContent(res);
      } catch (err) {
        console.log("覆盖率着色失败", err);
        const r = codeToHtml(defaultValue, {
          lang: "javascript",
          theme: theme === "light" ? "light-plus" : "tokyo-night",
        });

        setContent(r);
      }
    });
  }, []);

  return (
    <div className={"px-[12px] overflow-x-auto w-full"}>
      <div dangerouslySetInnerHTML={{ __html: content }}></div>
    </div>
  );
};

export default ShikiDetail;
