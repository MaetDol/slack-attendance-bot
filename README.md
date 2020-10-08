# slack-attendance-bot
웹코방 슬랙에서 사용할 출석체크 관리 봇입니다

# 명령어

## 특정 채팅방에서, `@TIL content`
특정 채널에서 해당 봇을 멘션하면 봇이 확인 후 해당 메시지에 \
:ballot_box_with_check: 이모지를(이모지를 보여주는 폰트에 따라 약간씩 다릅니다) 달아줍니다. \
기존에 존재하던 메시지를 수정해도 봇이 해당 메시지를 수집합니다. \
하지만 며칠 전 글이어도 메시지를 수정한 기준으로 날짜를 기록해두기 때문에 염두에 두고 수정해주셔야 합니다.

## DM으로, `#channel 진도` 또는 `#channel 오늘`
DM으로 해당 명령어를 입력하면 해당 채널의 당일 제출 현황을 보여줍니다. \
채널은 클릭시 해당 채널로 이동할 수 있는 형태인 `링크`로 적어주셔야 합니다. \
`진도` 또는 `오늘` 이라는 키워드의 순서는 `오늘 #channel` 같이 사용해도 상관없습니다. \
해당 채널에 있는 모든 사람들을 대상으로 하는게 아닌 최소 한번이라도 인증한 사람을 보여줍니다.

## DM으로, `#channel 어제`
진도 명령어와 같은 형식으로 어제 제출 현황을 보여줍니다.


# 해당 레포지토리를 사용할때 세팅

## properties.env 파일(생성필요)
- `signing_secret={Signing Secret 키}` - 이벤트 메시지를 슬랙에서 보냈는지 확인할때 사용하는 키입니다.
- `xoxb_token={발급받은 토큰}` - 슬랙에서 앱을 만들면 발급받을 수 있는 토큰입니다.
- `LOG_DIR=/usr/src/app/logs` - 노드 로그를 저장할 도커 내 패스입니다. 해당값으로 유지해주세요
- `CONSOLE=false` - 로거로 받은 메시지들을 console.log로 출력할지 여부입니다. __생략해도 됩니다.__
- `MYSQL_ROOT_PASSWORD={사용할 mariadb 비밀번호}` - MariaDB 비밀번호입니다.

## docker-compose.yml 파일
 - `ports: '8079:8079'` - 내부포트는 8079포트를 이용합니다. 외부포트는 필요한 포트로 바꿔 사용하시면 됩니다.
 
## Slack Bot 권한 설정
### Event Subscriptions
- `app_mention` - 봇을 호출해 출석할때 사용
- `message.im` - DM으로 출석 상태 조회할때 사용

### Scopes
- `app_mentions:read` - app_mention 이벤트 구독을 위해 필요
- `im:history` - message.im 이벤트 구독을 위해 필요
- `reactions:write` - 봇이 확인한 후 이모지를 달아주거나 삭제하기 위해 필요
- `channels:read`, `groups:read`, `im:read`, `mpim:read` - 특정 채널 유저 목록을 조회할때 필요
- `chat:write`, `im:write` - DM으로 메시지를 보낼때 필요


