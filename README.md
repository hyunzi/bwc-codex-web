# bwc-codex-web

## 개요
- **Mini Readers**는 Spring Boot 3.5 기반의 REST API로, 한 구절과 최대 세 개의 감정 태그, 선택 메모를 기록해 공유용 카드 데이터를 만들어 줍니다.
- **데이터베이스**: 프로젝트 내부 `mini-readers/data/mini-readers.db`에 위치한 SQLite 파일을 사용하며, 애플리케이션 시작 시 `SchemaMigrator`가 `mood_tags` 컬럼을 포함한 테이블을 자동으로 맞춰 줍니다.
- **자동화**: Playwright 스크립트를 포함하고 있어 공유 카드를 캡처 이미지로 빠르게 저장할 수 있습니다.

## 폴더 구조
```text
bwc-codex-web/
├── mini-readers/                 # Spring Boot 서비스 전체
│   ├── src/main/java             # Java 소스
│   ├── src/main/resources        # 설정, 스키마, 정적 자산
│   ├── data/mini-readers.db      # 로컬 SQLite (개발용)
│   ├── playwright/capture.spec.ts
│   └── pom.xml
├── mcp/mini-readers-openapi.yaml # MCP(OpenAPI) 실습용 스펙
├── package.json / package-lock.json
└── README.md
```

## Mini Readers 실행 가이드
1. **사전 준비**
   - JDK 21, Maven 3.9+, (Playwright를 쓸 경우) Node.js 18+ 설치
   - `mini-readers/data/mini-readers.db`는 개발용 샘플 DB이므로 초기화가 필요하면 파일을 삭제 후 서버를 재시작하면 됩니다.
2. **빌드 및 서버 실행**
   ```bash
   cd mini-readers
   mvn clean package        # 테스트 포함 빌드
   java -jar target/mini-readers-0.0.1-SNAPSHOT.jar
   ```
   개발 중에는 마지막 줄 대신 `mvn spring-boot:run`을 사용해도 됩니다.
3. **주요 API**
   - `GET /api/quotes` : 최근 구절 목록
   - `POST /api/quotes` : 구절 생성(`QuoteRequest` 스키마 준수)
   - `GET /api/quotes/{id}/share` : 공유 카드용 메시지 반환

## MCP(OpenAPI) 실습 가이드
1. MCP 호환 클라이언트(예: VS Code MCP 확장, Claude Desktop 등)에 `mcp/mini-readers-openapi.yaml`을 등록합니다.
2. 로컬 서버를 구동한 상태에서 MCP 서버 URL을 `http://localhost:8080`으로 지정합니다.
3. 추천 실습 순서
   1. `POST /api/quotes`로 샘플 데이터를 입력합니다.
      ```bash
      curl -X POST http://localhost:8080/api/quotes \
        -H 'Content-Type: application/json' \
        -d '{
              "passage": "완벽함보다 꾸준함",
              "note": "감정을 최소 하나 기록해보기",
              "moods": ["기대", "차분"]
            }'
      ```
   2. MCP 프롬프트에 “최근 구절 알려줘”처럼 자연어 요청을 보내면 클라이언트가 OpenAPI 스펙을 참고해 `GET /api/quotes`나 `GET /api/quotes/{id}/share`를 호출합니다.
4. 서버 주소가 바뀌면 `mini-readers-openapi.yaml`의 `servers` 섹션을 수정해 주세요.

## Playwright 캡처 워크플로
1. `mvn spring-boot:run`으로 API를 켠 상태를 유지합니다.
2. 최초 1회 의존성을 설치합니다.
   ```bash
   cd mini-readers
   npm install
   npx playwright install
   ```
3. 캡처 실행:
   ```bash
   MINI_READERS_URL=http://localhost:8080 \
   npx playwright test playwright/capture.spec.ts --project=chromium
   ```
   생성된 이미지는 `mini-readers/playwright/screenshots/mini-readers.png`에 저장됩니다.
4. `--headed` 옵션으로 브라우저 화면을 보거나, 실패 시 생성되는 `trace.zip`을 `npx playwright show-trace trace.zip`으로 분석할 수 있습니다.

## 문제 해결
- Windows 샌드박스에서 `cmd.exe CreatePipe error=5` 오류로 테스트 포크가 차단될 경우, `mvn clean package -DskipTests`로 빌드한 뒤 제한이 없는 환경에서 다시 테스트를 실행하세요.
- SQLite 파일이 잠겼다는 메시지가 보이면 애플리케이션을 종료하고 `mini-readers/data/mini-readers.db`를 삭제하거나 백업 후 재시작하면 새로 생성됩니다.
